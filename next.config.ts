import type { NextConfig } from 'next';
import {execFileSync} from 'node:child_process';
import {version} from './package.json';
function commitSha(){
 const supplied=process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||process.env.BUILD_COMMIT_SHA;
 if(supplied)return supplied;
 try{return execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:3000,stdio:['ignore','pipe','ignore']}).trim();}catch{return 'unknown';}
}
const config: NextConfig = {
  poweredByHeader: false,
  env:{NEXT_PUBLIC_APP_VERSION:version,NEXT_PUBLIC_BUILD_COMMIT:commitSha(),NEXT_PUBLIC_BUILD_TIME:new Date().toISOString()},
  async headers() {
    return [{source:'/:path*',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'X-Frame-Options',value:'DENY'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
      {key:'Strict-Transport-Security',value:'max-age=31536000'},
      {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'"+(process.env.NODE_ENV==='development'?" 'unsafe-eval'":"")+"; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"+(process.env.NODE_ENV==='development'?" ws: wss:":"")+"; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"},
    ]},{source:'/api/:path*',headers:[{key:'Cache-Control',value:'no-store'}]}];
  },
  outputFileTracingIncludes: {
    '/api/routes': ['./routes.csv', './my_forecast.csv'],
    '/api/predict': ['./routes.csv', './my_forecast.csv'],
  },
};
export default config;
