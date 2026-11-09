import type { NextConfig } from 'next';
const config: NextConfig = {
  outputFileTracingIncludes: {
    '/api/routes': ['./routes.csv', './my_forecast.csv'],
    '/api/predict': ['./routes.csv', './my_forecast.csv'],
  },
};
export default config;
