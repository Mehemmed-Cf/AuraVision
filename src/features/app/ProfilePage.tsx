import { ChevronRight, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return `${p[0]![0] ?? ''}${p[1]![0] ?? ''}`.toUpperCase();
}

const mobilityLabel: Record<string, string> = {
  wheelchair: 'Əlil arabası',
  visual: 'Görmə məhdudiyyəti',
  respiratory: 'Tənəffüs xəstəliyi',
  stroller: 'Uşaq arabası',
  standard: 'Standart',
};

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [notif, setNotif] = useState(true);
  const [locationOn, setLocationOn] = useState(false);

  if (!user) return null;

  const ini = initials(user.name);
  const joined = new Date(user.joinedAt).toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const votes = user.votesContributed ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--cyan-hover)] text-[20px] font-bold text-[var(--navy)]"
              aria-hidden="true"
            >
              {ini}
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[var(--text-1)]">{user.name}</h1>
              <p className="mt-1 text-[14px] text-[var(--text-2)]">{user.email}</p>
              <span className="mt-2 inline-block rounded-full border border-[var(--cyan)] px-3 py-1 text-[12px] text-[var(--cyan)]">
                {mobilityLabel[user.mobilityProfile] ?? user.mobilityProfile}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 self-start rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 py-2 text-[13px] text-[var(--text-2)] hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
            aria-label="Redaktə et"
          >
            <Pencil className="h-4 w-4" />
            Redaktə
          </button>
        </div>
      </div>

      <section className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5">
        <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-1)]">Statistika</h2>
        <ul className="space-y-2 text-[14px] text-[var(--text-2)]">
          <li className="flex justify-between">
            <span>Təqdim olunan bildirişlər</span>
            <span className="font-semibold text-[var(--cyan)]">{user.reportsSubmitted ?? 0}</span>
          </li>
          <li className="flex justify-between">
            <span>Üzvdür</span>
            <span>{joined}</span>
          </li>
          <li className="flex justify-between">
            <span>İnkluzivlik töhfəsi (səslər)</span>
            <span className="font-semibold text-[var(--cyan)]">{votes}</span>
          </li>
        </ul>
      </section>

      <section className="overflow-hidden rounded-[var(--r-md)] bg-[var(--navy-raised)]">
        {[
          {
            key: 'notif',
            icon: '🔔',
            label: 'Bildirişlər',
            right: (
              <button
                type="button"
                role="switch"
                aria-checked={notif}
                onClick={() => setNotif((v) => !v)}
                className={[
                  'relative h-7 w-12 rounded-full transition-colors',
                  notif ? 'bg-[var(--cyan)]' : 'bg-[var(--navy-border)]',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-6 w-6 rounded-full bg-[var(--navy)] transition-transform',
                    notif ? 'left-6' : 'left-0.5',
                  ].join(' ')}
                />
              </button>
            ),
          },
          {
            key: 'loc',
            icon: '📍',
            label: 'Lokasiya icazəsi',
            right: (
              <button
                type="button"
                role="switch"
                aria-checked={locationOn}
                onClick={() => setLocationOn((v) => !v)}
                className={[
                  'relative h-7 w-12 rounded-full transition-colors',
                  locationOn ? 'bg-[var(--cyan)]' : 'bg-[var(--navy-border)]',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-6 w-6 rounded-full bg-[var(--navy)] transition-transform',
                    locationOn ? 'left-6' : 'left-0.5',
                  ].join(' ')}
                />
              </button>
            ),
          },
          {
            key: 'lang',
            icon: '🌐',
            label: 'Dil: Azərbaycan',
            right: <ChevronRight className="h-5 w-5 text-[var(--text-3)]" aria-hidden="true" />,
          },
          {
            key: 'priv',
            icon: '🔒',
            label: 'Məxfilik',
            right: <ChevronRight className="h-5 w-5 text-[var(--text-3)]" aria-hidden="true" />,
          },
        ].map((row, i, arr) => (
          <div
            key={row.key}
            className={[
              'flex items-center justify-between px-5 py-4',
              i < arr.length - 1 ? 'border-b border-[var(--navy-border)]' : '',
            ].join(' ')}
          >
            <span className="text-[14px] text-[var(--text-1)]">
              <span className="mr-2" aria-hidden="true">
                {row.icon}
              </span>
              {row.label}
            </span>
            {row.right}
          </div>
        ))}
      </section>

      <div className="rounded-[var(--r-md)] border border-[rgba(239,68,68,0.3)] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-[var(--r-md)] border border-[var(--error)] py-3 text-[14px] font-semibold text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)]"
        >
          Çıxış
        </button>
      </div>
    </div>
  );
}
