import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Map, Plus, User } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMapStore } from '@/stores/mapStore';

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return `${p[0]![0] ?? ''}${p[1]![0] ?? ''}`.toUpperCase();
}

const tabs = [
  { to: '/dashboard', label: 'Əsas', icon: LayoutDashboard },
  { to: '/map', label: 'Xəritə', icon: Map },
  { to: '/report', label: 'Bildir', icon: Plus },
  { to: '/profile', label: 'Profil', icon: User },
] as const;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export function AppShell() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const setActiveProfile = useMapStore((s) => s.setActiveProfile);

  useEffect(() => {
    if (user?.mobilityProfile) {
      setActiveProfile(user.mobilityProfile);
    }
  }, [user?.mobilityProfile, setActiveProfile]);

  const ini = user ? initials(user.name) : '?';
  const isMapPage = location.pathname === '/map';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--navy)]">
      <header
        className="flex h-[60px] shrink-0 items-center justify-between border-b border-[var(--navy-border)] bg-[var(--navy-card)] px-4"
        role="banner"
      >
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path
              d="M20 2L4 10v12c0 9.5 6.8 18.4 16 20 9.2-1.6 16-10.5 16-20V10L20 2z"
              stroke="var(--cyan)"
              strokeWidth="2"
              fill="rgba(0,212,255,0.08)"
            />
            <path
              d="M20 12v16M14 18h12M14 24h8"
              stroke="var(--cyan)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span
            className="text-[18px] font-bold tracking-tight text-[var(--text-1)]"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            AURA
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-[var(--r-md)] p-2 text-[var(--text-2)] hover:bg-[var(--navy-raised)] hover:text-[var(--cyan)]"
            aria-label="Bildirişlər"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cyan)] text-[13px] font-bold text-[var(--navy)]"
            aria-hidden="true"
          >
            {ini}
          </div>
        </div>
      </header>

      <main
        className="min-h-0 flex-1 pb-[72px]"
        style={{ overflow: isMapPage ? 'hidden' : 'auto', height: isMapPage ? '100%' : 'auto' }}
      >
        {isMapPage ? (
          <Outlet />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="min-h-full"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t border-[var(--navy-border)] bg-[var(--navy-card)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Əsas naviqasiya"
      >
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 border-t-2 text-[11px] transition-colors',
                isActive
                  ? 'border-[var(--cyan)] text-[var(--cyan)]'
                  : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]',
              ].join(' ')
            }
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
