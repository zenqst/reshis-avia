'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeSlash, CaretDown } from '@phosphor-icons/react';
import { positions } from '@/entities/user';
import { Logo } from '@/shared/ui/logo';
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
 const register = mode === 'register';
 const router = useRouter();
 const [visible,setVisible] = useState(false);
 const [pending,setPending] = useState(false);
 const [error,setError] = useState('');
 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();setError('');
  const fields = Object.fromEntries(new FormData(event.currentTarget));
  if(register && fields.password !== fields.confirmPassword){setError('Пароли не совпадают');return;}
  setPending(true);
  try {
   const response = await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
   if(!response.ok){const body=await response.json().catch(()=>null);throw Error(body?.error ?? 'Сервис авторизации пока недоступен');}
   router.replace('/');router.refresh();
  } catch(error){setError(error instanceof Error ? error.message : 'Не удалось подключиться к серверу');}
  finally{setPending(false);}
 }
 return <div className="auth-screen"><Link href="/" className="auth-brand"><Logo/>Решись Авиа</Link>
 <section className="auth-card"><div className="auth-tabs"><Link href="/login" aria-current={!register?'page':undefined}>Вход</Link><Link href="/register" aria-current={register?'page':undefined}>Регистрация</Link></div>
 <h1>{register?'Создайте профиль':'Войдите в аккаунт'}</h1><p className="auth-description">{register?'Укажите данные для работы с прогнозами рейсов.':'Прогнозы загрузки и управление ценой — в одном месте.'}</p>
 <form onSubmit={submit}>
 {register&&<label>ФИО<input name="fullName" autoComplete="name" placeholder="Иванов Иван Иванович" required minLength={3} maxLength={150}/></label>}
 <label>Электронная почта<input name="email" type="email" autoComplete="email" placeholder="name@company.ru" required maxLength={254}/></label>
 {register&&<label>Должность<div className="auth-select"><select name="position" defaultValue="Аналитик">{positions.map(position=><option key={position}>{position}</option>)}</select><CaretDown size={18}/></div></label>}
 <label>Пароль<div className="auth-password"><input name="password" type={visible?'text':'password'} autoComplete={register?'new-password':'current-password'} required minLength={register?10:1} maxLength={128} placeholder={register?'Не менее 10 символов':'Ваш пароль'}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Скрыть пароль':'Показать пароль'}>{visible?<EyeSlash size={20}/>:<Eye size={20}/>}</button></div></label>
 {register&&<label>Повторите пароль<input name="confirmPassword" type={visible?'text':'password'} autoComplete="new-password" required minLength={10} maxLength={128}/></label>}
 {error&&<p className="auth-error" role="alert">{error}</p>}
 <button className="auth-submit" disabled={pending}>{pending?'Подождите…':register?'Зарегистрироваться':'Войти'}</button>
 </form><p className="auth-footer">{register?'Уже есть аккаунт?':'Нет аккаунта?'} <Link href={register?'/login':'/register'}>{register?'Войти':'Зарегистрироваться'}</Link></p></section></div>;
}
