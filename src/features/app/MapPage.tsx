import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import { MapPin, Plus, ThumbsUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  BAKU_CENTER,
  BARRIER_TYPE_LABEL,
  FILTER_CHIPS,
  PROFILE_ROADS,
  type BarrierReport,
  type BarrierType,
} from '@/stores/mapStore';
import { useMapStore } from '@/stores/mapStore';
import { useRouteStore } from '@/stores/routeStore';

function markerIcon(severity: 'low' | 'medium' | 'high') {
  const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'aura-marker-wrap',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

/** react-leaflet's whenReady is () => void; Leaflet map is available via useMap here. */
function MapInvalidateOnReady() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(id);
  }, [map]);
  return null;
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
  const user = useAuthStore((s) => s.user);
  const routeResult = useRouteStore((s) => s.lastResult);
  const activeProfile = user?.mobilityProfile ?? 'standard';

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

  const profileRoads = useMemo(
    () => PROFILE_ROADS.filter((road) => road.recommendedFor.includes(activeProfile)),
    [activeProfile],
  );

  const selectedRoads = useMemo(() => {
    if (!routeResult) return profileRoads;
    const byId = new Set(routeResult.profileRoadIds);
    const matched = PROFILE_ROADS.filter((road) => byId.has(road.id));
    return matched.length > 0 ? matched : profileRoads;
  }, [routeResult, profileRoads]);
  const routePath = useMemo(() => routeResult?.waypoints ?? [], [routeResult]);

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
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '12px 16px',
          background: 'var(--navy-card)',
        }}
      >
        <div className="flex flex-wrap gap-2">
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

      <div
        style={{
          position: 'fixed',
          top: '116px',
          left: 0,
          right: 0,
          bottom: '64px',
          zIndex: 0,
        }}
      >
        <MapContainer
          center={BAKU_CENTER}
          zoom={13}
          className="rounded-none"
          scrollWheelZoom
          preferCanvas
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution=""
            maxZoom={19}
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          <MapInvalidateOnReady />
          <MapResize selected={selected} />
          {routePath.length > 1 ? (
            <Polyline positions={routePath} pathOptions={{ color: '#00d4ff', weight: 4, opacity: 0.95 }} />
          ) : (
            selectedRoads.map((road) => (
              <Polyline
                key={road.id}
                positions={road.points}
                pathOptions={{ color: '#00d4ff', weight: 4, opacity: 0.85 }}
              />
            ))
          )}
          {reports.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={markerIcon(r.severity)}
              eventHandlers={{ click: () => setSelected(r) }}
            />
          ))}
        </MapContainer>
      </div>

      <Link
        to="/report"
        style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 1000 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cyan)] text-[var(--navy)] shadow-lg"
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

    </div>
  );
}
