import {readJson,requireOrigin,errorResponse} from '@/shared/server/request';
import {getUser} from '@/entities/user/server/session';
import { readData } from '@/entities/flight/server/data';
import { predict } from '@/entities/flight/model/prediction';
export const runtime='nodejs';
export async function POST(request:Request){
 try{requireOrigin(request);if(!await getUser())return Response.json({error:"Требуется вход"},{status:401});
 const input=await readJson(request);
 const q=input.q??0.5;
 if(typeof q!=='number'||!Number.isFinite(q)||q<0.1||q>0.9||Math.abs(q*10-Math.round(q*10))>1e-8)return Response.json({error:'Квантиль должен быть от 0.1 до 0.9 с шагом 0.1'},{status:400});
 if(!input||typeof input.route!=='string'||typeof input.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||typeof input.price!=='number'||!Number.isFinite(input.price))return Response.json({error:'Ожидаются route, date и числовая price'},{status:400});
 try{const data=await readData();const route=data.routes.find(r=>r.route===input.route);if(!route)return Response.json({error:'Маршрут не найден'},{status:404});
 if(input.price<route.price_min||input.price>route.price_max)return Response.json({error:'Цена вне диапазона'},{status:422});
 const forecast=data.getForecast(input.route,input.date);if(!forecast)return Response.json({error:'Прогноз на эту дату отсутствует'},{status:404});
 return Response.json({...predict(route,forecast,input.price,q),forecast});
 }catch{return Response.json({error:'Данные прогноза недоступны или повреждены. Проверьте CSV и повторите загрузку.'},{status:500});}
 }catch(error){return errorResponse(error);}
}
