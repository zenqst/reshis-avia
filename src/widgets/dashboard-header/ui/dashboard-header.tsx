import type { FlightCode } from '@/entities/flight';
import { FlightSelector } from '@/features/select-flight';
import { ProfileMenu } from '@/features/profile-menu';
import { Logo } from '@/shared/ui/logo';
type Props = { selected: FlightCode; onSelect: (code: FlightCode) => void; onSignOut: () => void };
export function DashboardHeader({ selected, onSelect, onSignOut }: Props) {
  return <header><div className="header-inner">
    <div className="brand"><Logo />Решись Авиа</div>
    <div className="controls"><FlightSelector selected={selected} onSelect={onSelect} />
      <div className="date">2026-06-12 (Пт)</div>
    </div>
    <ProfileMenu onSignOut={onSignOut} />
  </div></header>;
}
