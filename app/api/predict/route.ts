import {getUser} from '@/entities/user/server/session';
import { readData } from '@/entities/flight/server/data';
import { predict } from '@/entities/flight/model/prediction';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!await getUser())return Response.json({error:"Требуется вход"},{status:401});
 let input;try{input=await request.json();}catch{return Response.json({error:'Некорректный JSON'},{status:400});}
 if(!input||typeof input.route!=='string'||typeof input.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||typeof input.price!=='number'||!Number.isFinite(input.price))return Response.json({error:'Ожидаются route, date и числовая price'},{status:400});
 try{const data=await readData();const route=data.routes.find(r=>r.route===input.route);if(!route)return Response.json({error:'Маршрут не найден'},{status:404});
 if(input.price<route.price_min||input.price>route.price_max)return Response.json({error:'Цена вне диапазона'},{status:422});
 const forecast=data.getForecast(input.route,input.date);if(!forecast)return Response.json({error:'Прогноз на эту дату отсутствует'},{status:404});
 return Response.json({...predict(route,forecast,input.price),forecast});
 }catch{return Response.json({error:'Ошибка чтения данных'},{status:500});}
}
