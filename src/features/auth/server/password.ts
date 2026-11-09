import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
const options={N:32768,r:8,p:3,maxmem:64*1024*1024};
function derive(password:string,salt:string,legacy=false):Promise<Buffer>{return new Promise((resolve,reject)=>scrypt(password,salt,64,legacy?{}:options,(error,key)=>error?reject(error):resolve(key)));}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt-v1:${salt}:${(await derive(password,salt)).toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){
 const parts=stored.split(':');const legacy=parts.length===2;
 const [salt,hash]=legacy?parts:parts.slice(1);
 if((!legacy&&parts[0]!=='scrypt-v1')||!/^[a-f0-9]{32}$/.test(salt??'')||!/^[a-f0-9]{128}$/.test(hash??''))return false;
 const actual=await derive(password,salt,legacy);return timingSafeEqual(actual,Buffer.from(hash,'hex'));
}
export const dummyHash=`scrypt-v1:${'0'.repeat(32)}:${'0'.repeat(128)}`;
