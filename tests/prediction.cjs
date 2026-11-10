const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/entities/flight/model/prediction.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m.exports});
const {predict}=m.exports;
const r={base_price:8000,cost_per_passenger:3000,price_sensitivity:.1,price_min:1000,price_max:20000};
let checks=0;
for(const base of [Array(9).fill(0),Array(9).fill(800),[100,200,300,400,600,1000,1500,2000,3000]])for(const seats of [1,150,900])for(let i=1;i<=9;i++){
 const f={base,seats},q=i/10,d=predict(r,f,8000,q),best=predict(r,f,d.optimalPrice,q);
 assert.equal(d.desired,Math.max(0,base[i-1]));assert(d.bought>=0&&d.bought<=seats);assert.equal(Math.max(...d.points.map(p=>p.y)),100);assert(d.points.every(p=>p.x>=0&&Number.isFinite(p.y)));
 for(let p=r.price_min;p<=r.price_max;p+=100)assert(best.profit+1e-6>=predict(r,f,p,q).profit);
 checks++;
}
for(const q of [0,1,.15,NaN])assert.throws(()=>predict(r,{base:Array(9).fill(800),seats:900},8000,q));
console.log(`Forecast checks passed: ${checks} scenarios, grid optimality, zero demand/spread, capacity, quantile validation`);
