import {redirect} from 'next/navigation';
import {getUser} from '@/entities/user/server/session';
import {DashboardPage} from '@/pages/dashboard';
export default async function Page(){const user=await getUser();if(!user)redirect('/login');return <DashboardPage user={user}/>;}
