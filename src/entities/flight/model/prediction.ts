export type Route = { route: string; name: string; base_price: number; cost_per_passenger: number; price_sensitivity: number; price_min: number; price_max: number; dates: string[] };
export type Forecast = { seats: number; base: number[] };
export function predict(r: Route, f: Forecast, price: number, q = 0.5) {
 const b = r.price_sensitivity, c = r.cost_per_passenger, index = Math.min(8, Math.max(0, Math.round(q * 10) - 1)), d = f.base[index];
 const clamp = (p: number) => Math.min(r.price_max, Math.max(r.price_min, p));
 const candidates = [r.price_min, r.price_max, clamp((d+b*(r.base_price+c))/(2*b)), clamp(r.base_price+(d-f.seats)/b)];
 const profit = (p: number) => (p-c)*Math.min(f.seats,Math.max(0,d-b*(p-r.base_price)));
 const optimalPrice = candidates.reduce((a,p) => profit(p)>profit(a)?p:a);
 const quantiles = f.base.map(x => Math.max(0,x-b*(price-r.base_price)));
 const desired = quantiles[index], bought = Math.min(f.seats,desired), revenue=price*bought, costs=c*bought;
 // Gaussian approximation of the forecast spread; avoid division by zero.
 const sigma = Math.max((quantiles[8] - quantiles[0]) / 2.56, 0.5);
 const left = Math.max(0, Math.round(desired - 3.5 * sigma));
 const right = Math.max(left + 1, Math.round(desired + 3.5 * sigma));
 const xs = Array.from({length: Math.ceil((right-left)/2)+1}, (_,i)=>Math.min(right,left+i*2));
 xs.push(desired); xs.sort((a,b)=>a-b);
 const points = xs.map(x=>({x,y:Math.exp(-0.5*((x-desired)/sigma)**2)*100}));
 return {q,sigma,price,optimalPrice,desired,bought,seats:f.seats,loadFactor:bought/f.seats*100,free:f.seats-bought,revenue,costs,profit:revenue-costs,profitDelta:revenue-costs-profit(r.base_price),baseDemand:d,uncertainty:quantiles[8]-quantiles[0],quantiles,points};
}
export type Prediction = ReturnType<typeof predict>;
