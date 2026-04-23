import { motion } from 'framer-motion';
import { Loader2, MapPin, Route, Shield, Wind } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  BARRIER_TYPE_LABEL,
  useMapStore,
  type BarrierReport,
  type BarrierSeverity,
} from '@/stores/mapStore';
import { useRouteStore } from '@/stores/routeStore';
import { runTests } from '@/tests/routeTest';

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

interface NominatimHit {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface RoutePointSelection {
  displayName: string;
  lat: number;
  lng: number;
}

function RouteNominatimField({
  label,
  id,
  value,
  onChange,
  onPick,
  placeholder,
  onLocateClick,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  onPick: (sel: RoutePointSelection) => void;
  placeholder: string;
  onLocateClick?: () => void;
}) {
  const [hits, setHits] = useState<NominatimHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const q = value.trim();
      if (q.length < 2) {
        setHits([]);
        setOpen(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=az&limit=5`;
      try {
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'AuraVision/1.0 (dashboard routing)',
          },
        });
        if (!res.ok) {
          setHits([]);
          return;
        }
        const data = (await res.json()) as NominatimHit[];
        setHits(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <label htmlFor={id} className="mb-1 block text-[13px] text-[var(--text-2)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (hits.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={[
            'w-full rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] py-2.5 text-[15px] text-[var(--text-1)]',
            onLocateClick ? 'pl-3 pr-10' : 'px-3',
          ].join(' ')}
        />
        {onLocateClick ? (
          <button
            type="button"
            aria-label="Mövqeyimdən avtomatik doldur"
            className="absolute right-[10px] top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-[var(--cyan)]"
            onClick={onLocateClick}
          >
            <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {open ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-auto rounded-[var(--r-md)] bg-[var(--navy-raised)] shadow-lg"
          style={{ border: '1px solid var(--navy-border)' }}
        >
          {loading ? (
            <div className="px-[14px] py-[10px] text-[13px] text-[var(--text-2)]">Axtarılır...</div>
          ) : hits.length > 0 ? (
            hits.map((h) => (
              <button
                key={h.place_id}
                type="button"
                className="block w-full border-0 border-b border-[var(--navy-border)] bg-transparent px-[14px] py-[10px] text-left text-[13px] text-[var(--text-1)] last:border-b-0 hover:bg-[var(--cyan-dim)] hover:text-[var(--cyan)]"
                onClick={() => {
                  onPick({
                    displayName: h.display_name,
                    lat: Number(h.lat),
                    lng: Number(h.lon),
                  });
                  setOpen(false);
                }}
              >
                {h.display_name}
              </button>
            ))
          ) : (
            <div className="px-[14px] py-[10px] text-[13px] text-[var(--text-2)]">Nəticə tapılmadı</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

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
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromSelection, setFromSelection] = useState<RoutePointSelection | null>(null);
  const [toSelection, setToSelection] = useState<RoutePointSelection | null>(null);

  const fillFromGeolocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                Accept: 'application/json',
                'User-Agent': 'AuraVision/1.0 (dashboard routing)',
              },
            },
          );
          const data = (await res.json()) as { display_name?: string };
          const label =
            data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setFromAddress(label);
          setFromSelection({ displayName: label, lat: latitude, lng: longitude });
        } catch {
          const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setFromAddress(label);
          setFromSelection({ displayName: label, lat: latitude, lng: longitude });
        }
      },
      () => {},
    );
  }, []);

  useEffect(() => {
    fillFromGeolocation();
  }, [fillFromGeolocation]);

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
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/ledger"
            className="rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 py-2 text-[13px] text-[var(--cyan)] hover:border-[var(--cyan)]"
          >
            B2G — Nasimi ledger
          </Link>
          <Link
            to="/last-meter"
            className="rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 py-2 text-[13px] text-[var(--cyan)] hover:border-[var(--cyan)]"
          >
            Last-meter xəritə (Mapbox)
          </Link>
        </div>
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
        <div className="mb-4 flex items-start justify-between gap-2">
          <h3 className="text-[18px] font-semibold text-[var(--text-1)]">Marşrut Hesabla</h3>
          <button
            type="button"
            onClick={() => void runTests()}
            className="shrink-0 rounded-[var(--r-md)] border border-[var(--navy-border)] px-2 py-1 text-[11px] font-medium text-[var(--text-3)] hover:border-[var(--text-3)] hover:text-[var(--text-2)]"
          >
            Test Çalıştır
          </button>
        </div>
        <form className="space-y-4" onSubmit={onRoute}>
          <div>
            <RouteNominatimField
              id="route-from"
              label="Haradan:"
              value={fromAddress}
              placeholder="Başlanğıc ünvanı daxil edin"
              onChange={(v) => {
                setFromAddress(v);
                setFromSelection(null);
              }}
              onPick={(sel) => {
                setFromAddress(sel.displayName);
                setFromSelection(sel);
              }}
              onLocateClick={fillFromGeolocation}
            />
          </div>
          <div>
            <RouteNominatimField
              id="route-to"
              label="Haraya:"
              value={toAddress}
              placeholder="Təyinat ünvanını daxil edin"
              onChange={(v) => {
                setToAddress(v);
                setToSelection(null);
              }}
              onPick={(sel) => {
                setToAddress(sel.displayName);
                setToSelection(sel);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={routeLoading || !fromSelection || !toSelection}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--cyan)] font-semibold text-[var(--navy)] disabled:opacity-60"
          >
            {routeLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Hesablanır...
              </>
            ) : (
              'Hesabla'
            )}
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
            <div className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] p-4 text-center">
              <p className="text-[12px] uppercase tracking-wide text-[var(--text-2)]">İnkluzivlik indeksi</p>
              <p
                className={[
                  'text-[44px] font-bold leading-tight',
                  routeResult.inclusivityIndex > 70
                    ? 'text-[var(--success)]'
                    : routeResult.inclusivityIndex >= 40
                      ? 'text-[var(--warning)]'
                      : 'text-[var(--error)]',
                ].join(' ')}
              >
                {routeResult.inclusivityIndex}
              </p>
            </div>
            <div className="flex justify-between gap-4 text-[14px] text-[var(--text-2)]">
              <span>Məsafə: {routeResult.distance}</span>
              <span>Müddət: {routeResult.duration}</span>
            </div>
            {routeResult.barrierCount > 0 ? (
              <p className="rounded-[var(--r-md)] bg-[rgba(245,158,11,0.12)] px-3 py-2 text-[13px] text-[var(--warning)]">
                Diqqət: marşrut boyu {routeResult.barrierCount} bildirilmiş maneəyə yaxınlıq var.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {routeResult.warnings.map((w) => (
                <span
                  key={w}
                  className="rounded-full bg-[rgba(245,158,11,0.18)] px-2 py-1 text-[11px] leading-snug text-[var(--warning)]"
                >
                  {w}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/map')}
              className="h-12 w-full rounded-[var(--r-md)] bg-[var(--cyan)] font-semibold text-[var(--navy)] hover:opacity-95"
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
