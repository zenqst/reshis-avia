import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/app/styles/globals.css';
export const metadata: Metadata = { title: 'Решись Авиа', description: 'Управление ценой и прогнозом загрузки рейсов' };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="ru"><body><div id="root">{children}</div></body></html>;
}
