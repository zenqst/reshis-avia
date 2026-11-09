export function FlightSummary({ destination }: { destination: string }) { return (
<section className="meta">
<div>Направление: <span>Москва - {destination}</span> <span>12 июня 2026</span>
</div>
<div>Базовая цена: <span>8 000 ₽</span>
</div>
<div>Переменные затраты: <span>4 200 ₽</span>
</div>
<div>Эластичность: <span>0.141 пасс/₽</span>
</div>
<div>Диапазон: <span>5 000 ₽</span> - <span>16 000 ₽</span>
</div>
</section>
); }
