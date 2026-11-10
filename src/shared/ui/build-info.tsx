'use client';
import {useEffect} from 'react';
let logged=false;
export function BuildInfo(){
 useEffect(()=>{
  if(logged)return;
  logged=true;
  console.info('[Решись Авиа] Версия сборки',{
   version:process.env.NEXT_PUBLIC_APP_VERSION,
   commit:process.env.NEXT_PUBLIC_BUILD_COMMIT,
   builtAt:process.env.NEXT_PUBLIC_BUILD_TIME,
   mode:process.env.NODE_ENV,
  });
 },[]);
 return null;
}
