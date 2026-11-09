 'use client';
import {useEffect,useRef,useState} from 'react';
import {CaretDown} from '@phosphor-icons/react';
const format=(value:string)=>value?`${value} (${new Intl.DateTimeFormat('ru-RU',{weekday:'short',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'))})`: 'Выберите дату';
export function DatePicker({dates,value,onChange}:{dates:string[];value:string;onChange:(date:string)=>void}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 return <div className="date-picker" ref={root} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}}>
 <button ref={trigger} className="date" aria-expanded={open} aria-controls="flight-dates" aria-label="Дата рейса" onClick={()=>setOpen(!open)}>{format(value)}<CaretDown size={18} weight="fill"/></button>
 {open&&<div id="flight-dates" className="date-options" aria-label="Доступные даты">{dates.map(date=><button key={date} className={date===value?'selected':''} aria-pressed={date===value} onClick={()=>{onChange(date);setOpen(false);trigger.current?.focus();}}>{format(date)}</button>)}</div>}
 </div>;
}
