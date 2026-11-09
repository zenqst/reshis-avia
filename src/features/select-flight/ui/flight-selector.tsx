'use client';
import { flights, type FlightCode } from '@/entities/flight';
type Props = { selected: FlightCode; onSelect: (code: FlightCode) => void };
export function FlightSelector({ selected, onSelect }: Props) {
  return <nav aria-label="Направления">{flights.map(({ code }) => (
    <button key={code} aria-pressed={code === selected} className={code === selected ? 'active' : ''} onClick={() => onSelect(code)}>{code}</button>
  ))}</nav>;
}
