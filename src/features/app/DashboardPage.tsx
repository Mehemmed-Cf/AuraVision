import { motion } from 'framer-motion';
import { Route, Shield, Wind } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressAutocomplete } from '@/components/location/AddressAutocomplete';
import type { AddressSuggestion } from '@/services/locationService';
import { useAuthStore } from '@/stores/authStore';
import {
  BARRIER_TYPE_LABEL,
  useMapStore,
  type BarrierReport,
  type BarrierSeverity,
} from '@/stores/mapStore';
import { useRouteStore } from '@/stores/routeStore';

function severityDot(sev: BarrierSeverity) {
  const c =
    sev === 'high' ? 'bg-[var(--error)]' : sev === 'medium' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]';
  return <span className={`h-2 w-2 shrink-0 rounded-full ${c}`} aria-hidden="true" />;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('az-AZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const statCardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const mobility = user?.mobilityProfile ?? 'standard';

  const getRecentReports = useMapStore((s) => s.getRecentReports);
  const getAllReports = useMapStore((s) => s.getAllReports);
  const recent = getRecentReports(5);
  const barrierTotal = getAllReports().length;

  const calculateRoute = useRouteStore((s) => s.calculateRoute);
  const routeLoading = useRouteStore((s) => s.isLoading);
  const routeResult = useRouteStore((s) => s.lastResult);
  const clearRoute = useRouteStore((s) => s.clearResult);
  const routeError = useRouteStore((s) => s.error);

  const [mockKm] = useState(() => (4 + Math.random() * 2).toFixed(1));
  const [fromAddress, setFromAddress] = useState('Nizami m/st');
  const [toAddress, setToAddress] = useState('Sahil bulvarı');
  const [fromSelection, setFromSelection] = useState<AddressSuggestion | null>(null);
  const [toSelection, setToSelection] = useState<AddressSuggestion | null>(null);

  if (!user) return null;

  const mobilityLabel: Record<string, string> = {
    wheelchair: 'Əlil arabası',
    visual: 'Görmə məhdudiyyəti',
    respiratory: 'Tənəffüs xəstəliyi',
    stroller: 'Uşaq arabası',
    standard: 'Standart',
  };

  const onRoute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fromSelection || !toSelection) return;
    clearRoute();
    await calculateRoute({
      from: fromSelection.displayName,
      to: toSelection.displayName,
      profile: mobility,
      fromLat: fromSelection.lat,
      fromLng: fromSelection.lng,
      toLat: toSelection.lat,
      toLng: toSelection.lng,
    });
  };

  return (
    <div className="space-y-6 px-4 py-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--r-lg)] border border-[var(--navy-border)] border-l-[3px] border-l-[var(--cyan)] bg-gradient-to-br from-[var(--navy-card)] to-[var(--navy-raised)] p-6"
        style={{ background: 'linear-gradient(135deg, var(--navy-card) 0%, var(--navy-raised) 100%)' }}
      >
        <h2 className="mb-2 text-[24px] font-semibold text-[var(--text-1)]">Salam, {user.name}!</h2>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--cyan)] bg-[var(--cyan-dim)] px-3 py-1 text-[13px] text-[var(--cyan)]">
            {mobilityLabel[mobility] ?? mobility}
          </span>
        </div>
        <p className="text-[14px] text-[var(--text-2)]">{formatDate(new Date())}</p>
      </motion.section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            i: 0,
            icon: Shield,
            title: 'Ətrafınızdakı maneələr',
            value: String(barrierTotal),
            sub: '',
          },
          {
            i: 1,
            icon: Wind,
            title: 'Hava keyfiyyəti',
            value: 'Orta',
            sub: 'AQI',
          },
          {
            i: 2,
            icon: Route,
            title: 'Bu gün marşrut',
            value: `${mockKm} km`,
            sub: '',
          },
        ].map((card) => (
          <motion.div
            key={card.title}
            custom={card.i}
            variants={statCardVariants}
            initial="hidden"
            animate="show"
            className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5"
          >
            <div className="mb-3 flex items-center gap-2 text-[var(--cyan)]">
              <card.icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <p className="mb-2 text-[13px] text-[var(--text-2)]">{card.title}</p>
            {card.sub === 'AQI' ? (
              <p className="text-[32px] font-semibold text-[var(--warning)]">{card.value}</p>
            ) : (
              <p className="text-[32px] font-semibold text-[var(--cyan)]">{card.value}</p>
            )}
          </motion.div>
        ))}
      </section>

      <section className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5">
        <h3 className="mb-4 text-[18px] font-semibold text-[var(--text-1)]">Marşrut Hesabla</h3>
        <form className="space-y-4" onSubmit={onRoute}>
          <div>
            <AddressAutocomplete
              label="Haradan:"
              value={fromAddress}
              onChange={(v) => {
                setFromAddress(v);
                setFromSelection(null);
              }}
              onSelect={(selection) => {
                setFromAddress(selection.displayName);
                setFromSelection(selection);
              }}
              aria-label="Haradan"
              placeholder="Başlanğıc ünvanı daxil edin"
            />
          </div>
          <div>
            <AddressAutocomplete
              label="Haraya:"
              value={toAddress}
              onChange={(v) => {
                setToAddress(v);
                setToSelection(null);
              }}
              onSelect={(selection) => {
                setToAddress(selection.displayName);
                setToSelection(selection);
              }}
              aria-label="Haraya"
              placeholder="Təyinat ünvanını daxil edin"
            />
          </div>
          <button
            type="submit"
            disabled={routeLoading || !fromSelection || !toSelection}
            className="h-12 w-full rounded-[var(--r-md)] bg-[var(--cyan)] font-semibold text-[var(--navy)] disabled:opacity-60"
          >
            {routeLoading ? 'Hesablanır...' : 'Hesabla'}
          </button>
          {(!fromSelection || !toSelection) && !routeLoading ? (
            <p className="text-[12px] text-[var(--text-3)]">Marşrutu hesablamaq üçün siyahıdan hər iki ünvanı seçin.</p>
          ) : null}
          {routeError ? <p className="text-[12px] text-[var(--error)]">{routeError}</p> : null}
        </form>

        {routeResult ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4 border-t border-[var(--navy-border)] pt-6"
          >
            <div className="rounded-[var(--r-md)] border border-[var(--cyan)] bg-[var(--cyan-dim)] p-4 text-center shadow-[0_0_24px_var(--cyan-glow)]">
              <p className="text-[12px] uppercase tracking-wide text-[var(--text-2)]">İnkluzivlik indeksi</p>
              <p className="text-[40px] font-bold text-[var(--cyan)]">{routeResult.inclusivityIndex}</p>
            </div>
            <div className="flex justify-between text-[14px] text-[var(--text-2)]">
              <span>Məsafə: {routeResult.distance}</span>
              <span>Müddət: {routeResult.duration}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {routeResult.warnings.map((w) => (
                <span
                  key={w}
                  className="rounded-full border border-[var(--warning)] bg-[rgba(245,158,11,0.12)] px-2 py-1 text-[12px] text-[var(--warning)]"
                >
                  {w}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/map')}
              className="h-12 w-full rounded-[var(--r-md)] border border-[var(--cyan)] font-semibold text-[var(--cyan)] hover:bg-[var(--cyan-dim)]"
            >
              Xəritədə Gör
            </button>
          </motion.div>
        ) : null}
      </section>

      <section>
        <h3 className="mb-3 text-[18px] font-semibold text-[var(--text-1)]">Son Bildirilən Maneələr</h3>
        <div className="space-y-2">
          {recent.map((r: BarrierReport) => (
            <div
              key={r.id}
              className="flex items-start gap-3 rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-3"
            >
              {severityDot(r.severity)}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-[var(--text-1)]">{r.address}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-3)]">
                  <span className="rounded border border-[var(--navy-border)] px-1.5 py-0.5 text-[var(--text-2)]">
                    {BARRIER_TYPE_LABEL[r.type]}
                  </span>
                  <span>▲ {r.votes}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString('az-AZ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] p-4">
        <p className="mb-2 text-[13px] text-[var(--text-2)]">Bakı — Hava keyfiyyəti indeksi (AQI)</p>
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          <div className="absolute inset-0 flex">
            <div className="h-full flex-[3] bg-[var(--success)]" title="Yaxşı" />
            <div className="h-full flex-[2] bg-[var(--warning)]" title="Orta" />
            <div className="h-full flex-1 bg-[var(--error)]" title="Zəif" />
          </div>
          <div
            className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-[var(--text-1)] shadow"
            style={{ left: '52%' }}
            aria-label="Cari AQI təxmini 72, Orta"
          />
        </div>
        <p className="mt-2 text-[14px] font-medium text-[var(--warning)]">72 — Orta</p>
      </section>
    </div>
  );
}
