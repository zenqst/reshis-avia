import 'server-only';
export async function query<T extends Record<string,unknown>>(sql:string,params:unknown[]=[]):Promise<T[]> {
 const connection=process.env.DATABASE_URL;
 if(!connection)throw new Error('DATABASE_NOT_CONFIGURED');
 const url=new URL(connection);
 const response=await fetch(`https://${url.hostname}/sql`,{method:'POST',headers:{'Content-Type':'application/json','Neon-Connection-String':connection,'Neon-Raw-Text-Output':'false','Neon-Array-Mode':'false'},body:JSON.stringify({query:sql,params}),cache:'no-store',signal:AbortSignal.timeout(10000)});
 const result=await response.json();
 if(!response.ok)throw Object.assign(new Error('DATABASE_ERROR'),{code:result.code});
 return result.rows;
}
let ready:Promise<void>|undefined;
export function ensureSchema(){
 return ready??=(async()=>{
 await query(`CREATE TABLE IF NOT EXISTS app_users(id uuid PRIMARY KEY, email text UNIQUE NOT NULL, full_name text NOT NULL, position text NOT NULL, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
 await query(`CREATE TABLE IF NOT EXISTS app_sessions(token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL)`);
 await query(`ALTER TABLE app_sessions ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now()`);
 await query(`CREATE INDEX IF NOT EXISTS app_sessions_user_idx ON app_sessions(user_id)`);
 await query(`CREATE INDEX IF NOT EXISTS app_sessions_expiry_idx ON app_sessions(expires_at)`);
 await query(`CREATE TABLE IF NOT EXISTS app_auth_limits(key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL)`);
 })().catch(error=>{ready=undefined;throw error;});
}
