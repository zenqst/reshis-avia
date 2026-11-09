import {authHandler} from '@/features/auth/server/handler';
export const runtime='nodejs';
export async function POST(request:Request){return authHandler(request,'register');}
