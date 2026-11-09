export const flights = [
  { code: 'MOW-AER', destination: 'Сочи' },
  { code: 'MOW-LED', destination: 'Санкт-Петербург' },
  { code: 'MOW-KGD', destination: 'Калининград' },
  { code: 'MOW-MRV', destination: 'Минеральные Воды' },
  { code: 'MOW-OVB', destination: 'Новосибирск' },
] as const;
export type FlightCode = (typeof flights)[number]['code'];
