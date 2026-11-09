'use client';
import type {UserProfile} from '@/entities/user';
import {useEffect,useState} from 'react';
import {getLoadStatus} from '@/entities/flight';
import {predict,type Route,type Forecast} from '@/entities/flight/model/prediction';
import {ForecastSkeleton} from '@/widgets/forecast-skeleton';
import {DemandDistribution} from '@/widgets/demand-chart';
import {ProfileMenu} from '@/features/profile-menu';
import {ArrowCounterClockwise} from '@phosphor-icons/react';
import {RiskPicker} from '@/features/select-risk/ui/risk-picker';
import {DatePicker} from '@/features/select-date';
import {Logo} from '@/shared/ui/logo';
const number=(n:number)=>n.toLocaleString('ru-RU',{maximumFractionDigits:0});
const decimal=(n:number,digits=2)=>n.toLocaleString('ru-RU',{minimumFractionDigits:digits,maximumFractionDigits:digits});
const signedMoney=(n:number)=>`${n>=0?'+':'−'}${decimal(Math.abs(n)/1e6)} млн`;
export function DashboardPage({user}:{user:UserProfile}){
 const [routes,setRoutes]=useState<Route[]>([]),[code,setCode]=useState(''),[date,setDate]=useState(''),[forecast,setForecast]=useState<Forecast|null>(null),[price,setPrice]=useState(0),[edit,setEdit]=useState(false),[error,setError]=useState(''),[out,setOut]=useState(false);
 const [q,setQ]=useState(0.5);
 const route=routes.find(r=>r.route===code);
 useEffect(()=>{const controller=new AbortController();fetch('/api/routes',{signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('Не удалось загрузить маршруты');return r.json() as Promise<Route[]>;}).then(rows=>{setRoutes(rows);setCode(rows[0]?.route??'');setDate(rows[0]?.dates[0]??'');}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[]);
 useEffect(()=>{if(!route||!date)return;const controller=new AbortController();setForecast(null);setError('');fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({route:route.route,date,price:route.base_price}),signal:controller.signal}).then(async r=>{const body=await r.json();if(!r.ok)throw Error(body.error);return body;}).then(body=>{setForecast(body.forecast);setPrice(predict(route,body.forecast,route.base_price,q).optimalPrice);setEdit(false);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[route,date]);
 if(out)return <div className="signed-out"><h1>Вы вышли</h1><button onClick={()=>setOut(false)}>Вернуться в демо</button></div>;
 const data=route&&forecast?predict(route,forecast,price,q):null;
 const loadStatus=data?getLoadStatus(data.loadFactor,data.desired,data.seats):null;
 const changePrice=(value:number)=>{if(route&&Number.isFinite(value))setPrice(Math.min(route.price_max,Math.max(route.price_min,value)));};
 return <><header><div className="header-inner"><div className="brand"><Logo/>Решись Авиа</div><div className="controls"><nav aria-label="Направления">{routes.map(r=><button key={r.route} className={code===r.route?'active':''} onClick={()=>{setCode(r.route);setDate(r.dates.includes(date)?date:r.dates[0]);}}>{r.route}</button>)}</nav><DatePicker dates={route?.dates??[]} value={date} onChange={setDate}/></div><ProfileMenu user={user} onSignOut={async()=>{const response=await fetch("/api/auth/logout",{method:"POST"});if(response.ok)window.location.assign("/login");else setError("Не удалось выйти. Повторите попытку.");}}/></div></header><main>
 {error&&<p role="alert">{error}</p>}
 {!data||!route?(error?<p>Данные недоступны</p>:<ForecastSkeleton/>):<><section className="meta"><div>Направление: <span>{route.name}</span></div><div>Базовая цена: <span>{number(route.base_price)} ₽</span></div><div>Затраты: <span>{number(route.cost_per_passenger)} ₽</span></div><div>Эластичность: <span>{route.price_sensitivity} пасс/₽</span></div><div>Диапазон: <span>{number(route.price_min)}–{number(route.price_max)} ₽</span></div></section><section className="cards">
 <article><h2>{edit?'Цена билета':Math.abs(price-data.optimalPrice)>.5?'Установленная цена':'Рекомендованная цена'}</h2>{edit?<div className="price-editor"><input aria-label="Цена билета" type="number" min={route.price_min} max={route.price_max} step={100} value={Math.round(price)} onChange={e=>changePrice(e.target.valueAsNumber)}/><input aria-label="Слайдер цены" type="range" min={route.price_min} max={route.price_max} step={100} value={price} onChange={e=>changePrice(e.target.valueAsNumber)}/><button onClick={()=>setPrice(data.optimalPrice)}><ArrowCounterClockwise size={16}/> Оптим.</button><button onClick={()=>setEdit(false)}>Готово</button></div>:<><div className="metric"><strong>{number(price)} ₽</strong></div><div className="detail"><RiskPicker value={q} onChange={next=>{setQ(next);if(forecast)setPrice(predict(route,forecast,price,next).optimalPrice);}}/><button onClick={()=>setEdit(true)}>Изменить цену</button></div></>}</article>
 <article><h2>Прогноз загрузки</h2><div className="metric"><strong>{data.loadFactor.toFixed(1)}%</strong><b className={loadStatus?.color} title={loadStatus?.label}>{number(data.bought)} / {data.seats}</b></div><div className="detail"><span>Желают: <em>{number(data.desired)}</em></span><span>Свободно: <em>{number(data.free)}</em></span></div></article>
 <article><h2>Ожидаемая прибыль за рейс</h2><div className="metric"><strong>{decimal(data.profit/1e6)} млн</strong><b className={data.profitDelta>=0?"green":"red"} title="Изменение прибыли относительно базовой цены">{signedMoney(data.profitDelta)}</b></div><div className="detail"><span>Доход: <em>{decimal(data.revenue/1e6)} млн</em></span><span>Расход: <em>{decimal(data.costs/1e6)} млн</em></span></div></article>
 <article><h2>Диапазон неопределённости</h2><div className="metric"><strong>Δ {number(data.uncertainty)} пасс.</strong><b className="yellow" title="Половина диапазона q10–q90 относительно медианного спроса">{data.desired>0?`±${decimal(data.uncertainty/2/data.desired*100,1)}%`:"—"}</b></div><div className="detail"><span>Min: <em>{number(data.quantiles[0])}</em></span><span>Max: <em>{number(data.quantiles[8])}</em></span></div></article></section><DemandDistribution data={data}/></>}
 </main></>;
}
