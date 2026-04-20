import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import { MapPin, Plus, ThumbsUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  BAKU_CENTER,
  BARRIER_TYPE_LABEL,
  FILTER_CHIPS,
  type BarrierReport,
  type BarrierSeverity,
  type BarrierType,
} from '@/stores/mapStore';
import { useMapStore } from '@/stores/mapStore';

function iconFor(severity: BarrierSeverity) {
  const bg =
    severity === 'high' ? '#EF4444' : severity === 'medium' ? '#F59E0B' : '#10B981';
  const inner =
    severity === 'high'
      ? `<span style="font-weight:700;font-size:14px;color:#fff">!</span>`
      : '';
  const size = severity === 'high' ? 28 : 24;
  const html = `<div class="${severity === 'high' ? 'aura-pulse' : ''}" style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-sizing:border-box">${inner}</div>`;
  return L.divIcon({
    className: 'aura-marker-wrap',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function MapResize({ selected }: { selected: BarrierReport | null }) {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [map]);
  useEffect(() => {
    if (selected) {
      map.setView([selected.lat, selected.lng], 15, { animate: true });
    }
  }, [map, selected]);
  return null;
}

export function MapPage() {
  const seededReports = useMapStore((s) => s.seededReports);
  const submittedReports = useMapStore((s) => s.submittedReports);
  const voteReport = useMapStore((s) => s.voteReport);
  const incrementVoteUser = useAuthStore((s) => s.incrementVotesContributed);

  const [filter, setFilter] = useState<BarrierType | 'all'>('all');
  const [selected, setSelected] = useState<BarrierReport | null>(null);

  const reports = useMemo(() => {
    const all = [...submittedReports, ...seededReports];
    if (filter === 'all') return all;
    return all.filter((r) => r.type === filter);
  }, [submittedReports, seededReports, filter]);

  useEffect(() => {
    setSelected((prev) => {
      if (!prev) return prev;
      return reports.some((r) => r.id === prev.id) ? prev : null;
    });
  }, [reports]);

  const iconsById = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    reports.forEach((r) => {
      m.set(r.id, iconFor(r.severity));
    });
    return m;
  }, [reports]);

  const onVote = useCallback(
    (id: string) => {
      voteReport(id);
      incrementVoteUser();
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, votes: prev.votes + 1 } : prev,
      );
    },
    [voteReport, incrementVoteUser],
  );

  return (
    <div className="relative h-[calc(100dvh-124px-env(safe-area-inset-bottom))] min-h-[320px] w-full bg-[var(--navy)]">
      <div className="pointer-events-none absolute left-2 right-2 top-2 z-[500] flex flex-wrap gap-2">
        <div className="pointer-events-auto flex flex-wrap gap-2 rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)]/90 p-2 backdrop-blur-md">
          {FILTER_CHIPS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={[
                'rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
                filter === c.key
                  ? 'bg-[var(--cyan-dim)] text-[var(--cyan)]'
                  : 'text-[var(--text-2)] hover:text-[var(--text-1)]',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <MapContainer
        center={BAKU_CENTER}
        zoom={13}
        className="h-full w-full rounded-none"
        scrollWheelZoom
        aria-label="Bakı əlçatanlıq xəritəsi"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapResize selected={selected} />
        {reports.map((r) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={iconsById.get(r.id)!}
            eventHandlers={{
              click: () => setSelected(r),
            }}
          />
        ))}
      </MapContainer>

      <Link
        to="/report"
        className="fixed bottom-[88px] right-4 z-[600] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cyan)] text-[var(--navy)] shadow-lg"
        aria-label="Yeni maneə bildir"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>

      <AnimatePresence>
        {selected ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-16 left-0 right-0 z-[550] max-h-[55vh] overflow-auto rounded-t-[var(--r-xl)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-5 shadow-2xl"
          >
            <button
              type="button"
              className="mb-3 w-full text-left text-[12px] text-[var(--text-3)]"
              onClick={() => setSelected(null)}
            >
              Bağla
            </button>
            <img
              src={selected.imageUrl}
              alt=""
              className="mb-3 h-36 w-full rounded-[var(--r-md)] object-cover"
            />
            <h2 id="sheet-title" className="mb-1 flex items-start gap-2 text-[16px] font-semibold text-[var(--text-1)]">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--cyan)]" aria-hidden="true" />
              {selected.address}
            </h2>
            <p className="mb-2 text-[13px] text-[var(--text-2)]">{BARRIER_TYPE_LABEL[selected.type]}</p>
            <span
              className={[
                'mb-3 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
                selected.severity === 'high'
                  ? 'bg-[rgba(239,68,68,0.2)] text-[var(--error)]'
                  : selected.severity === 'medium'
                    ? 'bg-[rgba(245,158,11,0.2)] text-[var(--warning)]'
                    : 'bg-[rgba(16,185,129,0.2)] text-[var(--success)]',
              ].join(' ')}
            >
              {selected.severity === 'high' ? 'Yüksək' : selected.severity === 'medium' ? 'Orta' : 'Aşağı'}
            </span>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-[12px] text-[var(--text-2)]">
                <span>İnkluzivlik</span>
                <span>{selected.inclusivityScore}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--navy-raised)]">
                <div
                  className="h-full rounded-full bg-[var(--cyan)]"
                  style={{ width: `${selected.inclusivityScore}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onVote(selected.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--r-md)] border border-[var(--navy-border)] py-2.5 text-[14px] font-semibold text-[var(--text-1)] hover:border-[var(--cyan)]"
              >
                <ThumbsUp className="h-5 w-5" />
                Səs ver ({selected.votes})
              </button>
              <button
                type="button"
                className="flex-1 rounded-[var(--r-md)] bg-[var(--cyan)] py-2.5 text-[14px] font-semibold text-[var(--navy)]"
                onClick={() => {
                  /* mock add to route */
                  setSelected(null);
                }}
              >
                Marşruta əlavə et
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style>{`
        @keyframes aura-pulse-kf {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .aura-pulse { animation: aura-pulse-kf 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
