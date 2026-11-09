export type Route = { route: string; name: string; base_price: number; cost_per_passenger: number; price_sensitivity: number; price_min: number; price_max: number; dates: string[] };
export type Forecast = { seats: number; base: number[] };
export function predict(r: Route, f: Forecast, price: number) {
 const b = r.price_sensitivity, c = r.cost_per_passenger, d = f.base[4];
 const clamp = (p: number) => Math.min(r.price_max, Math.max(r.price_min, p));
 const candidates = [r.price_min, r.price_max, clamp((d+b*(r.base_price+c))/(2*b)), clamp(r.base_price+(d-f.seats)/b)];
 const profit = (p: number) => (p-c)*Math.min(f.seats,Math.max(0,d-b*(p-r.base_price)));
 const optimalPrice = candidates.reduce((a,p) => profit(p)>profit(a)?p:a);
 const quantiles = f.base.map(x => Math.max(0,x-b*(price-r.base_price)));
 const desired = quantiles[4], bought = Math.min(f.seats,desired), revenue=price*bought, costs=c*bought;
 const sigma = Math.max((quantiles[8]-quantiles[0])/2.56, 0.5);
 const left = desired-3.5*sigma, right = desired+3.5*sigma;
 const count = Math.max(2, Math.ceil((right-left)/2));
 const xs = Array.from({length:count+1},(_,i)=>left+(right-left)*i/count);
 xs.push(desired); xs.sort((a,b)=>a-b);
 const points = xs.map(x=>({x,y:Math.exp(-.5*((x-desired)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI))}));
 return {price,optimalPrice,desired,bought,seats:f.seats,loadFactor:bought/f.seats*100,free:f.seats-bought,revenue,costs,profit:revenue-costs,profitDelta:revenue-costs-profit(r.base_price),baseDemand:d,uncertainty:quantiles[8]-quantiles[0],quantiles,points};
}
export type Prediction = ReturnType<typeof predict>;
