import { readData } from '@/entities/flight/server/data';
export const runtime='nodejs';
export async function GET(){try{return Response.json((await readData()).routes);}catch{return Response.json({error:'Не удалось загрузить CSV'},{status:500});}}
