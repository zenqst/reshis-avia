import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Route, Forecast } from '../model/prediction';
function parse(text: string) {
 const rows: string[][]=[]; let row:string[]=[], value='', quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value.replace(/\r$/,''));value='';if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}}else value+=c;}
 if(value||row.length){row.push(value.replace(/\r$/,''));rows.push(row);} const headers=rows.shift()!;
 return rows.map(row=>Object.fromEntries(headers.map((h,i)=>[h.replace(/^\uFEFF/,''),row[i]])));
}
export async function readData(){
 const [rawRoutes,rawForecast]=await Promise.all(['routes.csv','my_forecast.csv'].map(name=>readFile(path.join(process.cwd(),name),'utf8')));
 const rows=parse(rawForecast);
 const routes:Route[]=parse(rawRoutes).map(row=>({route:row.route,name:row.name,...Object.fromEntries(['base_price','cost_per_passenger','price_sensitivity','price_min','price_max'].map(k=>[k,Number(row[k])])),dates:rows.filter(f=>f.route===row.route).map(f=>f.date).sort()} as Route));
 return { routes, getForecast(route:string,date:string):Forecast|undefined {const row=rows.find(f=>f.route===route&&f.date===date);return row?{seats:Number(row.seats),base:Array.from({length:9},(_,i)=>Number(row[`${((i+1)/10).toFixed(1)}_base_demand`]))}:undefined;} };
}
