 'use client';
import {useEffect,useRef,useState} from 'react';
import {CaretDown} from '@phosphor-icons/react';
export function RiskPicker({value,onChange}:{value:number;onChange:(q:number)=>void}){
 const [open,setOpen]=useState(false);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 return <div className="risk-quantile" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();setOpen(true);const key=e.key,target=e.target;setTimeout(()=>{const items=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.date-options button')??[]);const current=items.findIndex(item=>item===target);const selected=items.findIndex(item=>item.classList.contains('selected'));const index=key==='Home'?0:key==='End'?items.length-1:current<0?Math.max(0,selected):(current+(key==='ArrowDown'?1:-1)+items.length)%items.length;items[index]?.focus();},0);}if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}}>
 <span>q =</span><button ref={trigger} className="risk-trigger" aria-label="Квантиль риска" title="0,1 — консервативный; 0,5 — медиана; 0,9 — оптимистичный" aria-expanded={open} aria-controls="risk-options" onClick={()=>setOpen(!open)}>{value.toFixed(1).replace('.',',')}<CaretDown size={18} weight="fill"/></button>
 {open&&<div id="risk-options" className="date-options risk-options">{Array.from({length:9},(_,i)=>(i+1)/10).map(q=><button key={q} className={q===value?'selected':''} aria-pressed={q===value} onClick={()=>{onChange(q);setOpen(false);trigger.current?.focus();}}>{q.toFixed(1).replace('.',',')}</button>)}</div>}
 </div>;
}
