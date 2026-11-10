'use client';
import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import type { Prediction } from '@/entities/flight/model/prediction';
const BLUE='#474fea', RED='#EF4444';
export function DemandDistribution({data}:{data:Prediction}) {
 const [mode,setMode]=useState<'bell'|'quantiles'>('bell');
 const chartData=mode==='bell'?data:{...data,points:data.quantiles.map((x,i)=>({x,y:(i+1)*10}))};
 return <div className="distribution-panel"><div className="distribution-toolbar"><div className="chart-tabs" aria-label="Вид распределения"><button aria-pressed={mode==='bell'} onClick={()=>setMode('bell')}>Колокол</button><button aria-pressed={mode==='quantiles'} onClick={()=>setMode('quantiles')}>Квантили прогноза</button></div><span>Сценарий q = {data.q.toFixed(1).replace('.',',')}</span></div><DemandChart key={mode} data={chartData} mode={mode}/><p className="chart-explanation">{mode==='bell'?'Гауссовская аппроксимация вокруг выбранного спроса. Высота — относительная плотность, не вероятность. Красный хвост — спрос выше вместимости.':'Исходные квантили при введённой цене: между соседними уровнями — 10% вероятности. Линии — интерполяция; хвосты ниже q10 и выше q90 не показаны.'}</p><div style={{position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clipPath:"inset(50%)",whiteSpace:"nowrap"}}><table><caption>Квантили спроса при введённой цене</caption><thead><tr><th>Квантиль</th><th>Спрос, пассажиров</th></tr></thead><tbody>{data.quantiles.map((x,i)=><tr key={i}><th>{(i+1)/10}</th><td>{Math.round(x)}</td></tr>)}</tbody></table></div></div>;
}
function DemandChart({data,mode}:{data:Prediction;mode:'bell'|'quantiles'}) {
 const canvas=useRef<HTMLCanvasElement>(null);
 const instance=useRef<Chart<'line'>|null>(null);
 const latest=useRef(data);latest.current=data;
 useEffect(()=>{
  if(!canvas.current)return;
  const chart=new Chart(canvas.current,{
   type:'line',
   data:{datasets:[{data:[],borderColor:BLUE,pointRadius:mode==='bell'?0:4,borderWidth:3,tension:0,fill:false},{data:[],borderColor:RED,pointRadius:mode==='bell'?0:4,borderWidth:3,tension:0,fill:false}]},
   options:{responsive:true,maintainAspectRatio:false,parsing:false,animation:{duration:180},layout:{padding:{top:45,right:12}},plugins:{legend:{display:false}},scales:{x:{type:'linear',grid:{color:'#252525'},ticks:{color:'#8a8a8a',maxTicksLimit:10,precision:0,maxRotation:0,callback:value=>Math.round(Number(value)).toLocaleString('ru-RU')},title:{display:true,text:'Спрос, пасс.',color:'#8a8a8a'}},y:{min:0,max:100,ticks:{display:true,stepSize:20,color:'#8a8a8a',callback:value=>`${value}%`},grid:{color:'#252525'},title:{display:true,text:'Относительная плотность (пик = 100%)',color:'#8a8a8a'}}}},
   plugins:[{
    id:'distribution-markers',
    beforeDatasetsDraw(c){
     const d=latest.current,{ctx,chartArea:a}=c;
     const split=Math.max(a.left,Math.min(a.right,c.scales.x.getPixelForValue(d.seats)));
     for(let i=0;i<2;i++){
      ctx.save();ctx.beginPath();ctx.rect(i===0?a.left:split,a.top,i===0?split-a.left:a.right-split,a.bottom-a.top);ctx.clip();
      const gradient=ctx.createLinearGradient(0,a.top,0,a.bottom);gradient.addColorStop(0,i===0?'#474fea55':'#EF444455');gradient.addColorStop(1,i===0?'#474fea00':'#EF444400');ctx.fillStyle=gradient;
      ctx.beginPath();const points=c.getDatasetMeta(0).data.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));if(points.length){ctx.moveTo(points[0].x,a.bottom);for(const p of points)ctx.lineTo(p.x,p.y);ctx.lineTo(points[points.length-1].x,a.bottom);ctx.closePath();ctx.fill();}ctx.restore();
     }
    },
    beforeDatasetDraw(c,args){
     const a=c.chartArea,x=c.scales.x.getPixelForValue(latest.current.seats);
     c.ctx.save();c.ctx.beginPath();
     const split=Math.max(a.left,Math.min(a.right,x));
     c.ctx.rect(args.index===0?a.left:split,a.top,args.index===0?split-a.left:a.right-split,a.bottom-a.top);c.ctx.clip();
    },
    afterDatasetDraw(c){c.ctx.restore();},
    afterDraw(c){
     const d=latest.current,{ctx,chartArea:a}=c;
     const badge=(text:string,x:number,y:number,color:string)=>{ctx.font=`${a.width<360?11:14}px Medeo, sans-serif`;const w=Math.min(a.width,ctx.measureText(text).width+24);const left=Math.max(a.left,Math.min(a.right-w,x-w/2));ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(left,y,w,32,8);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(text,left+12,y+21,w-24);};
     ctx.save();
     const elements=c.getDatasetMeta(0).data;
     const marker=mode==='bell'?elements.reduce<typeof elements[number]|undefined>((best,p)=>!best||p.y<best.y?p:best,undefined):elements[Math.round(d.q*10)-1];
     const mx=marker?.x??c.scales.x.getPixelForValue(d.desired),py=marker?.y??c.scales.y.getPixelForValue(mode==='bell'?100:d.q*100);
     ctx.strokeStyle=BLUE;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mx,py);ctx.lineTo(mx,a.bottom);ctx.stroke();
     badge(`Выбранный спрос: ${Math.round(d.desired)} пасс.`,mx,Math.min(a.bottom-36,py+(a.bottom-py)*.45),BLUE);
     const sx=c.scales.x.getPixelForValue(d.seats);ctx.strokeStyle=RED;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(sx,a.top);ctx.lineTo(sx,a.bottom);ctx.stroke();ctx.setLineDash([]);
     badge(`Лимит вместимости: ${d.seats} мест`,sx,a.top-38,RED);ctx.restore();
    }
   }]
  });instance.current=chart;
  chart.options.scales!.y!.title!.text=mode==='bell'?'Относительная плотность (пик = 100%)':'Квантиль спроса, %';
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)chart.options.animation=false;
  return()=>{chart.destroy();instance.current=null;};
 },[]);
 useEffect(()=>{
  const c=instance.current;if(!c)return;
  c.data.datasets.forEach((set,i)=>{set.data=data.points.filter(p=>p.x>=0).map(p=>({x:p.x,y:p.y}));set.backgroundColor=context=>{
   const {ctx,chartArea:a}=context.chart;if(!a)return 'transparent';
   const gradient=ctx.createLinearGradient(0,a.top,0,a.bottom);gradient.addColorStop(0,i===0?'#474fea55':'#EF444455');gradient.addColorStop(1,i===0?'#474fea00':'#EF444400');return gradient;
  };});
  const right=data.points[data.points.length-1].x;
  // Include the forecast range and the seat limit.
  const options=c.options.scales!.x!;
  options.min=Math.max(0,Math.floor(Math.min(data.points[0].x,data.seats*.95)));
  options.max=Math.ceil(Math.max(right*1.08,data.seats*1.12)/10)*10;
  c.update();
 },[data]);
 return <section className="live-chart" aria-label="Распределение спроса"><div className="chart-canvas-frame"><canvas ref={canvas} role="img" aria-label={`Выбранный спрос ${Math.round(data.desired)} пассажиров, вместимость ${data.seats} мест`}/></div></section>;
}
