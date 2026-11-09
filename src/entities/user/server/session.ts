import 'server-only';
import {cookies} from 'next/headers';
import {createHash,randomBytes} from 'node:crypto';
import {query,ensureSchema} from '@/shared/server/database';
import type {UserProfile} from '../model/user';
const COOKIE='reshis_session';
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
export async function getUser():Promise<UserProfile|null>{
 const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;
 await ensureSchema();const rows=await query(`SELECT u.id,u.email,u.full_name,u.position FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()`,[digest(token)]);
 const u=rows[0];return u?{id:String(u.id),email:String(u.email),fullName:String(u.full_name),position:String(u.position)}:null;
}
export async function createSession(userId:string){
 const token=randomBytes(32).toString('hex');
 await query(`DELETE FROM app_sessions WHERE expires_at<now()`);
 await query(`INSERT INTO app_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')`,[digest(token),userId]);
 (await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});
}
export async function deleteSession(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token)await query('DELETE FROM app_sessions WHERE token_hash=$1',[digest(token)]);jar.delete(COOKIE);}
