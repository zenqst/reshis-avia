import 'server-only';
import {randomBytes,randomUUID,scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {query,ensureSchema} from '@/shared/server/database';
import {createSession,deleteSession} from '@/entities/user/server/session';
import {positions} from '@/entities/user';
const derive=promisify(scrypt);
export async function authHandler(request:Request,mode:'login'|'register'|'logout'){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Недопустимый источник запроса'},{status:403});
 try{
 await ensureSchema();
 if(mode==='logout'){await deleteSession();return Response.json({ok:true});}
 const body=await request.json();const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const password=body.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof password!=='string'||password.length>128||password.length<(mode==='register'?10:1))return Response.json({error:'Проверьте почту и пароль (не менее 10 символов при регистрации)'},{status:400});
 const key=createHash('sha256').update(email).digest('hex');
 const limits=await query(`INSERT INTO app_auth_limits(key,attempts,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN app_auth_limits.expires_at<now() THEN 1 ELSE app_auth_limits.attempts+1 END,expires_at=CASE WHEN app_auth_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE app_auth_limits.expires_at END RETURNING attempts`,[key]);
 if(Number(limits[0].attempts)>10)return Response.json({error:'Слишком много попыток. Повторите через 15 минут.'},{status:429});
 let id:string;
 if(mode==='register'){
 const name=typeof body.fullName==='string'?body.fullName.trim().replace(/\s+/g,' '):'';
 if(name.length<3||name.length>150||!positions.includes(body.position)||password!==body.confirmPassword)return Response.json({error:'Проверьте ФИО, должность и подтверждение пароля'},{status:400});
 const salt=randomBytes(16).toString('hex');const hash=(await derive(password,salt,64) as Buffer).toString('hex');id=randomUUID();
 await query(`INSERT INTO app_users(id,email,full_name,position,password_hash) VALUES($1,$2,$3,$4,$5)`,[id,email,name,body.position,`${salt}:${hash}`]);
 }else{
 const users=await query('SELECT id,password_hash FROM app_users WHERE email=$1',[email]);
 const [salt,hash]=String(users[0]?.password_hash??`${'0'.repeat(32)}:${'0'.repeat(128)}`).split(':');
 const actual=await derive(password,salt,64) as Buffer;
 if(!users[0]||!timingSafeEqual(actual,Buffer.from(hash,'hex')))return Response.json({error:'Неверная почта или пароль'},{status:401});id=String(users[0].id);
 }
 await createSession(id);await query('DELETE FROM app_auth_limits WHERE key=$1',[key]);return Response.json({ok:true});
 }catch(error){const code=(error as {code?:string}).code;if(code==='23505')return Response.json({error:'Не удалось зарегистрироваться с этими данными. Попробуйте войти.'},{status:409});return Response.json({error:'Сервис авторизации временно недоступен'},{status:503});}
}
