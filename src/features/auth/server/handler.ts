import 'server-only';
import {randomUUID,createHash} from 'node:crypto';
import {query,ensureSchema} from '@/shared/server/database';
import {requireOrigin,readJson,RequestError,errorResponse} from '@/shared/server/request';
import {createSession,deleteSession} from '@/entities/user/server/session';
import {positions} from '@/entities/user';
import {hashPassword,verifyPassword,dummyHash} from './password';
async function throttle(key:string,limit:number){
 const rows=await query(`INSERT INTO app_auth_limits(key,attempts,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN app_auth_limits.expires_at<now() THEN 1 ELSE app_auth_limits.attempts+1 END,expires_at=CASE WHEN app_auth_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE app_auth_limits.expires_at END RETURNING attempts`,[key]);
 if(Number(rows[0].attempts)>limit)throw new RequestError(429,'Слишком много попыток. Повторите через 15 минут.');
}
export async function authHandler(request:Request,mode:'login'|'register'|'logout'){
 try{
 requireOrigin(request);
 if(mode==='logout'){await deleteSession();return Response.json({ok:true});}
 const body=await readJson(request);
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const password=body.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length>128||password.length<(mode==='register'?15:1))throw new RequestError(400,'Проверьте почту и пароль (при регистрации — от 15 символов)');
 const name=typeof body.fullName==='string'?body.fullName.trim().replace(/\s+/g,' '):'';
 if(mode==='register'&&(name.length<3||name.length>150||/[\u0000-\u001f\u007f]/u.test(name)||!positions.includes(body.position as typeof positions[number])||password!==body.confirmPassword))throw new RequestError(400,'Проверьте ФИО, должность и подтверждение пароля');
 await ensureSchema();
 const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
 // Vercel supplies this header; local development shares a conservative bucket.
 const source=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')??'unknown':'local';
 await throttle('source:'+digest(source),40);
 const key='email:'+digest(email);await throttle(key,10);
 let id:string;
 if(mode==='register'){
 const hash=await hashPassword(password);id=randomUUID();
 await query(`INSERT INTO app_users(id,email,full_name,position,password_hash) VALUES($1,$2,$3,$4,$5)`,[id,email,name,body.position,hash]);
 }else{
 const users=await query('SELECT id,password_hash FROM app_users WHERE email=$1',[email]);
 const stored=String(users[0]?.password_hash??dummyHash);
 const valid=await verifyPassword(password,stored);
 if(!users[0]||!valid){console.info('auth_event',{event:'login_denied'});throw new RequestError(401,'Неверная почта или пароль');}
 id=String(users[0].id);
 if(!stored.startsWith('scrypt-v1:'))await query('UPDATE app_users SET password_hash=$1 WHERE id=$2',[await hashPassword(password),id]);
 }
 await createSession(id);await query('DELETE FROM app_auth_limits WHERE key=$1 OR expires_at<now()',[key]);
 console.info('auth_event',{event:mode==='register'?'registered':'login_success'});
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){if((error as {code?:string})?.code==='23505')return Response.json({error:'Не удалось зарегистрироваться с этими данными. Попробуйте войти.'},{status:409});return errorResponse(error);}
}
