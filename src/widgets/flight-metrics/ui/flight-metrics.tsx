export function FlightMetrics() { return (
<section className="cards">
<article>
<h2>Рекомендованная цена</h2>
<div className="metric">
<strong>9 472 ₽</strong>
<b className="green">+1 472 ₽</b>
</div>
<div className="detail">
<span>q = <em>0,5</em>
</span>
<button>Изменить цену</button>
</div>
</article>
<article>
<h2>Прогноз загрузки</h2>
<div className="metric">
<strong>82,6%</strong>
<b className="yellow">743/900 мест</b>
</div>
<div className="detail">
<span>Базовый спрос: <em>951</em>
</span>
<span>Свободно: <em>157</em>
</span>
</div>
</article>
<article>
<h2>Ожидаемая прибыль за рейс</h2>
<div className="metric">
<strong>3,92 млн</strong>
<b className="green">+0,5 млн</b>
</div>
<div className="detail">
<span>Выручка: <em>7,04 млн</em>
</span>
<span>Затраты: <em>3,12 млн</em>
</span>
</div>
</article>
<article>
<h2>Диапазон неопределённости</h2>
<div className="metric">
<strong>Δ 550 пасс.</strong>
<b className="yellow">±28.9%</b>
</div>
<div className="detail">
<span>Min: <em>676</em>
</span>
<span>Max: <em>1226</em>
</span>
</div>
</article>
</section>
); }
