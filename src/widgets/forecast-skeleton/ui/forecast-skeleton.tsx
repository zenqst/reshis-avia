export function ForecastSkeleton() {
 return <div className="forecast-skeleton" role="status" aria-label="Загрузка прогноза" aria-busy="true">
  <div className="skeleton-meta" aria-hidden="true">{Array.from({length:5},(_,i)=><div className="skeleton-block" key={i}/>)}</div>
  <div className="cards" aria-hidden="true">{Array.from({length:4},(_,i)=><article key={i}><div className="skeleton-block skeleton-title"/><div className="skeleton-block skeleton-value"/><div className="skeleton-block skeleton-detail"/></article>)}</div>
  <div className="skeleton-chart" aria-hidden="true"><div className="skeleton-block skeleton-chart-label"/></div>
 </div>;
}
