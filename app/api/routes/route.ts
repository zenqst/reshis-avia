import {getUser} from '@/entities/user/server/session';
import { readData } from '@/entities/flight/server/data';
export const runtime='nodejs';
export async function GET(){try{if(!await getUser())return Response.json({error:"Требуется вход"},{status:401});return Response.json((await readData()).routes);}catch{return Response.json({error:'Не удалось загрузить CSV'},{status:500});}}
