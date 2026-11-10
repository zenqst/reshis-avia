import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Route, Forecast } from '../model/prediction';
function parse(text: string) {
 const rows: string[][]=[]; let row:string[]=[], value='', quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value.replace(/\r$/,''));value='';if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}}else value+=c;}
 if(quoted)throw new Error('DATA_INVALID_CSV');
 if(value||row.length){row.push(value.replace(/\r$/,''));rows.push(row);} const headers=rows.shift();
 if(!headers?.length||new Set(headers).size!==headers.length||rows.some(row=>row.length!==headers.length))throw new Error('DATA_INVALID_CSV');
 return rows.map(row=>Object.fromEntries(headers.map((h,i)=>[h.replace(/^\uFEFF/,''),row[i]])));
}
export async function readData(){
 const [rawRoutes,rawForecast]=await Promise.all([readFile(path.join(process.cwd(),'routes.csv'),'utf8'),readFile(path.join(process.cwd(),'my_forecast.csv'),'utf8')]);
 const rows=parse(rawForecast);
 const routeRows=parse(rawRoutes);
 const numeric=['base_price','cost_per_passenger','price_sensitivity','price_min','price_max'];
 const baseKeys=Array.from({length:9},(_,i)=>`${((i+1)/10).toFixed(1)}_base_demand`);
 const validNumber=(v:unknown)=>typeof v==='string'&&v.trim()!==''&&Number.isFinite(Number(v));
 if(!routeRows.length||!rows.length||routeRows.some(r=>!r.route||!r.name||numeric.some(k=>!validNumber(r[k]))||Number(r.price_sensitivity)<=0||Number(r.price_min)<0||Number(r.price_max)<Number(r.price_min)||Number(r.cost_per_passenger)<0)||new Set(routeRows.map(r=>r.route)).size!==routeRows.length)throw new Error('DATA_INVALID_ROUTES');
 const known=new Set(routeRows.map(r=>r.route));
 if(rows.some(r=>!known.has(r.route)||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||new Date(r.date).toISOString().slice(0,10)!==r.date||!validNumber(r.seats)||Number(r.seats)<=0||!Number.isInteger(Number(r.seats))||baseKeys.some((k,i)=>!validNumber(r[k])||(i>0&&Number(r[k])<Number(r[baseKeys[i-1]]))))||new Set(rows.map(r=>`${r.route}:${r.date}`)).size!==rows.length||routeRows.some(r=>!rows.some(f=>f.route===r.route)))throw new Error('DATA_INVALID_FORECAST');
 const routes:Route[]=routeRows.map(row=>({route:row.route,name:row.name,...Object.fromEntries(numeric.map(k=>[k,Number(row[k])])),dates:rows.filter(f=>f.route===row.route).map(f=>f.date).sort()} as Route));
 return { routes, getForecast(route:string,date:string):Forecast|undefined {const row=rows.find(f=>f.route===route&&f.date===date);return row?{seats:Number(row.seats),base:Array.from({length:9},(_,i)=>Number(row[`${((i+1)/10).toFixed(1)}_base_demand`]))}:undefined;} };
}
