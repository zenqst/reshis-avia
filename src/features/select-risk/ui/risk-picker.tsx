 'use client';
import {useEffect,useRef,useState} from 'react';
import {CaretDown} from '@phosphor-icons/react';
export function RiskPicker({value,onChange}:{value:number;onChange:(q:number)=>void}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 return <div className="risk-quantile" ref={root} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}}>
 <span>q =</span><button ref={trigger} className="risk-trigger" aria-label="Квантиль риска" aria-expanded={open} aria-controls="risk-options" onClick={()=>setOpen(!open)}>{value.toFixed(1).replace('.',',')}<CaretDown size={18} weight="fill"/></button>
 {open&&<div id="risk-options" className="date-options risk-options">{Array.from({length:9},(_,i)=>(i+1)/10).map(q=><button key={q} className={q===value?'selected':''} aria-pressed={q===value} onClick={()=>{onChange(q);setOpen(false);trigger.current?.focus();}}>{q.toFixed(1).replace('.',',')}</button>)}</div>}
 </div>;
}
