 'use client';
import {useEffect,useRef,useState} from 'react';
import {CaretDown} from '@phosphor-icons/react';
const format=(value:string)=>value?`${value} (${new Intl.DateTimeFormat('ru-RU',{weekday:'short',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'))})`: 'Выберите дату';
export function DatePicker({dates,value,onChange}:{dates:string[];value:string;onChange:(date:string)=>void}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 return <div className="date-picker" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();setOpen(true);const key=e.key,target=e.target;setTimeout(()=>{const items=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.date-options button')??[]);const current=items.findIndex(item=>item===target);const selected=items.findIndex(item=>item.classList.contains('selected'));const index=key==='Home'?0:key==='End'?items.length-1:current<0?Math.max(0,selected):(current+(key==='ArrowDown'?1:-1)+items.length)%items.length;items[index]?.focus();},0);}if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}}>
 <button ref={trigger} className="date" aria-expanded={open} aria-controls="flight-dates" aria-label="Дата рейса" onClick={()=>setOpen(!open)}>{format(value)}<CaretDown size={18} weight="fill"/></button>
 {open&&<div id="flight-dates" className="date-options" aria-label="Доступные даты">{dates.map(date=><button key={date} className={date===value?'selected':''} aria-pressed={date===value} onClick={()=>{onChange(date);setOpen(false);trigger.current?.focus();}}>{format(date)}</button>)}</div>}
 </div>;
}
