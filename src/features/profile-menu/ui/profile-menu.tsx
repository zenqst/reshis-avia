'use client';
import { useEffect, useRef } from 'react';
import type {UserProfile} from '@/entities/user';
import { Logo } from '@/shared/ui/logo';
export function ProfileMenu({ user, onSignOut }: { user?: UserProfile; onSignOut: () => void }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  return <details ref={ref} className="profile" onKeyDown={event => {
    if (event.key === 'Escape' && ref.current) {
      ref.current.open = false;
      ref.current.querySelector('summary')?.focus();
    }
  }}>
    <summary className="user"><Logo />{user?.fullName??"Профиль"}</summary>
    <div className="profile-menu">{user&&<div className="profile-info"><strong>{user.fullName}</strong><span>{user.position}</span><span>{user.email}</span></div>}<button onClick={onSignOut}>Выйти</button></div>
  </details>;
}
