import { AnimatePresence, motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { MapPin, MapPinned, Navigation, Navigation2, Plus, ThumbsUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { Layer, Marker, Source, type MapRef } from 'react-map-gl/mapbox';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  BARRIER_TYPE_LABEL,
  FILTER_CHIPS,
  PROFILE_ROADS,
  type BarrierReport,
  type BarrierType,
} from '@/stores/mapStore';
import { useMapStore } from '@/stores/mapStore';
import { useRouteStore } from '@/stores/routeStore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';

interface OsrmAlternativeResponse {
  routes?: Array<{
    distance: number;
    geometry: { coordinates: [number, number][] };
  }>;
}

interface AlternativeRouteSummary {
  distance: string;
  lessBarriers: number;
}

function markerColor(severity: 'low' | 'medium' | 'high') {
  return severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981';
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function RouteEndpointMarkers({ routePath }: { routePath: [number, number][] }) {
  if (routePath.length < 2) return null;
  const [startLat, startLng] = routePath[0]!;
  const [endLat, endLng] = routePath[routePath.length - 1]!;
  const pinClass =
    'pointer-events-none flex flex-col items-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]';

  return (
    <>
      <Marker longitude={startLng} latitude={startLat} anchor="bottom">
        <div className={pinClass} role="img" aria-label="Marşrutun başlanğıcı">
          <div className="flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 shadow-lg ring-2 ring-emerald-900/40">
              <Navigation2 className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden="true" />
            </div>
            <span className="mt-1 max-w-[100px] truncate rounded bg-[var(--navy-card)]/95 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-500/50">
              Başlanğıc
            </span>
          </div>
        </div>
      </Marker>
      <Marker longitude={endLng} latitude={endLat} anchor="bottom">
        <div className={pinClass} role="img" aria-label="Marşrutun hədəfi">
          <div className="flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[var(--cyan)] shadow-lg ring-2 ring-[var(--cyan)]/30">
              <MapPinned className="h-5 w-5 text-[var(--navy)]" strokeWidth={2.25} aria-hidden="true" />
            </div>
            <span className="mt-1 max-w-[100px] truncate rounded bg-[var(--navy-card)]/95 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--cyan)] ring-1 ring-[var(--cyan)]/40">
              Hədəf
            </span>
          </div>
        </div>
      </Marker>
    </>
  );
}

export function MapPage() {
  const mapRef = useRef<MapRef>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);

  const seededReports = useMapStore((s) => s.seededReports);
  const submittedReports = useMapStore((s) => s.submittedReports);
  const voteReport = useMapStore((s) => s.voteReport);
  const getAllReports = useMapStore((s) => s.getAllReports);
  const incrementVoteUser = useAuthStore((s) => s.incrementVotesContributed);

  const [filter, setFilter] = useState<BarrierType | 'all'>('all');
  const [selected, setSelected] = useState<BarrierReport | null>(null);
  const user = useAuthStore((s) => s.user);
  const routeResult = useRouteStore((s) => s.lastResult);
  const fromAddress = useRouteStore((s) => s.fromAddress);
  const toAddress = useRouteStore((s) => s.toAddress);
  const setAlternativeWaypoints = useRouteStore((s) => s.setAlternativeWaypoints);
  const activeProfile = user?.mobilityProfile ?? 'standard';
  const [aiAltLoading, setAiAltLoading] = useState(false);
  const [aiAltSummary, setAiAltSummary] = useState<AlternativeRouteSummary | null>(null);
  const [highlightedRoute, setHighlightedRoute] = useState<'standard' | 'ai'>('standard');

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
  const alternativeRoutePath = useMemo(
    () => routeResult?.alternativeWaypoints ?? [],
    [routeResult],
  );

  useEffect(() => {
    if (alternativeRoutePath.length >= 2) {
      setHighlightedRoute('ai');
      return;
    }
    setHighlightedRoute('standard');
    setAiAltSummary(null);
  }, [alternativeRoutePath]);

  const routeGeoJson = useMemo(() => {
    if (routePath.length < 2) return null;
    const coordinates = routePath.map(([lat, lng]) => [lng, lat] as [number, number]);
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates },
    };
  }, [routePath]);

  const alternativeRouteGeoJson = useMemo(() => {
    if (alternativeRoutePath.length < 2) return null;
    const coordinates = alternativeRoutePath.map(([lat, lng]) => [lng, lat] as [number, number]);
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates },
    };
  }, [alternativeRoutePath]);

  const fallbackGeoJson = useMemo(() => {
    if (routePath.length > 1) return null;
    return {
      type: 'FeatureCollection' as const,
      features: selectedRoads.map((road) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: road.points.map(([lat, lng]) => [lng, lat] as [number, number]),
        },
      })),
    };
  }, [routePath.length, selectedRoads]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !selected) return;
    map.flyTo({ center: [selected.lng, selected.lat], zoom: 15, duration: 600 });
  }, [selected]);

  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const flyToMyLocation = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 16,
          duration: 1000,
        });
      },
      () => {},
    );
  }, []);

  const onComputeAiRoute = useCallback(async () => {
    if (!routeResult || !fromAddress || !toAddress || aiAltLoading) return;
    setAiAltLoading(true);
    try {
      const url = `http://router.project-osrm.org/route/v1/foot/${fromAddress.lng},${fromAddress.lat};${toAddress.lng},${toAddress.lat}?overview=full&geometries=geojson&alternatives=3`;
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as OsrmAlternativeResponse;
      const routes = data.routes ?? [];
      if (routes.length === 0) return;

      const allReports = getAllReports();
      const countBarriersNearWaypoints = (waypoints: [number, number][]) =>
        allReports.filter((report) =>
          waypoints.some(
            ([lat, lng]) =>
              haversineMeters({ lat, lng }, { lat: report.lat, lng: report.lng }) <= 150,
          ),
        ).length;

      const candidates = routes.map((route) => {
        const waypoints = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        const distanceKm = route.distance / 1000;
        return {
          waypoints,
          barrierCount: countBarriersNearWaypoints(waypoints),
          distanceText: `${distanceKm.toFixed(1)} km`,
        };
      });

      const best = candidates.sort((a, b) => a.barrierCount - b.barrierCount)[0];
      if (!best) return;

      const currentSignature = JSON.stringify(routeResult.waypoints);
      const bestSignature = JSON.stringify(best.waypoints);
      if (currentSignature !== bestSignature) {
        setAlternativeWaypoints(best.waypoints);
      }

      setAiAltSummary({
        distance: best.distanceText,
        lessBarriers: Math.max(0, routeResult.barrierCount - best.barrierCount),
      });
      setHighlightedRoute('ai');
    } finally {
      setAiAltLoading(false);
    }
  }, [
    aiAltLoading,
    fromAddress,
    getAllReports,
    routeResult,
    setAlternativeWaypoints,
    toAddress,
  ]);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
          {routePath.length >= 2 ? (
            <div
              className="flex shrink-0 items-center gap-4 border-t border-[var(--navy-border)] pt-2 text-[11px] text-[var(--text-2)] sm:border-0 sm:pt-0"
              role="group"
              aria-label="Marşrut işarələri"
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="absolute h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                </span>
                Başlanğıc
              </span>
              <span className="flex items-center gap-2">
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="absolute h-4 w-4 rounded-full bg-[var(--cyan)] ring-2 ring-white" />
                </span>
                Hədəf
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={mapWrapRef}
        style={{
          position: 'fixed',
          top: '116px',
          left: 0,
          right: 0,
          bottom: '64px',
          zIndex: 0,
        }}
      >
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{ longitude: 49.8671, latitude: 40.4093, zoom: 14 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/navigation-night-v1"
          onLoad={() => {
            const map = mapRef.current?.getMap();
            if (!map) return;

            if (routePath.length >= 2) {
              const bounds = new mapboxgl.LngLatBounds();
              routePath.forEach(([lat, lng]) => bounds.extend([lng, lat]));
              map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 800 });
              return;
            }

            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                map.flyTo({
                  center: [pos.coords.longitude, pos.coords.latitude],
                  zoom: 15,
                  duration: 1000,
                });
              },
              () => {},
            );
          }}
        >
          {routeGeoJson ? (
            <Source id="aura-route" type="geojson" data={routeGeoJson}>
              <Layer
                id="aura-route-glow"
                type="line"
                paint={{
                  'line-color': '#00D4FF',
                  'line-width': 14,
                  'line-opacity': highlightedRoute === 'standard' ? 0.15 : 0.08,
                }}
              />
              <Layer
                id="aura-route-core"
                type="line"
                paint={{
                  'line-color': '#00D4FF',
                  'line-width': 5,
                  'line-opacity': highlightedRoute === 'standard' ? 0.9 : 0.35,
                }}
              />
            </Source>
          ) : fallbackGeoJson && fallbackGeoJson.features.length > 0 ? (
            <Source id="aura-fallback-routes" type="geojson" data={fallbackGeoJson}>
              <Layer
                id="aura-fallback-glow"
                type="line"
                paint={{
                  'line-color': '#00D4FF',
                  'line-width': 14,
                  'line-opacity': 0.15,
                }}
              />
              <Layer
                id="aura-fallback-core"
                type="line"
                paint={{
                  'line-color': '#00D4FF',
                  'line-width': 5,
                  'line-opacity': 0.85,
                }}
              />
            </Source>
          ) : null}
          {alternativeRouteGeoJson ? (
            <Source id="aura-route-alt" type="geojson" data={alternativeRouteGeoJson}>
              <Layer
                id="aura-route-alt-glow"
                type="line"
                paint={{
                  'line-color': '#10B981',
                  'line-width': 14,
                  'line-opacity': highlightedRoute === 'ai' ? 0.15 : 0.08,
                }}
              />
              <Layer
                id="aura-route-alt-core"
                type="line"
                paint={{
                  'line-color': '#10B981',
                  'line-width': 5,
                  'line-opacity': highlightedRoute === 'ai' ? 0.9 : 0.35,
                }}
              />
            </Source>
          ) : null}
          {reports.map((r) => (
            <Marker key={r.id} longitude={r.lng} latitude={r.lat} anchor="center">
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent p-0"
                aria-label={BARRIER_TYPE_LABEL[r.type]}
                onClick={() => setSelected(r)}
              >
                <span
                  className="block"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: markerColor(r.severity),
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.25)',
                  }}
                />
              </button>
            </Marker>
          ))}
          <RouteEndpointMarkers routePath={routePath} />
        </Map>
      </div>

      {alternativeRoutePath.length >= 2 ? (
        <div
          className="rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-card)] px-3 py-2 text-[12px] text-[var(--text-2)]"
          style={{ position: 'fixed', top: '124px', right: '16px', zIndex: 500 }}
        >
          <p>🔵 Standart marşrut</p>
          <p>🟢 AI marşrutu (maneəsiz)</p>
        </div>
      ) : null}

      {routePath.length >= 2 && routeResult ? (
        <div
          className="rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-4"
          style={{
            position: 'fixed',
            bottom: '72px',
            left: '16px',
            right: '16px',
            zIndex: 500,
          }}
        >
          {alternativeRoutePath.length >= 2 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-[var(--text-2)]">🔵 Standart: {routeResult.distance}</span>
                <span className="text-[13px] text-[var(--text-2)]">
                  🟢 AI: {aiAltSummary?.distance ?? routeResult.distance} — {aiAltSummary?.lessBarriers ?? 0} maneə az
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setHighlightedRoute('standard')}
                  className="rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 py-2 text-[12px] font-semibold text-[var(--text-2)]"
                  style={{ opacity: highlightedRoute === 'standard' ? 1 : 0.6 }}
                >
                  Standartı göstər
                </button>
                <button
                  type="button"
                  onClick={() => setHighlightedRoute('ai')}
                  className="rounded-[var(--r-md)] border border-[var(--cyan)] bg-[var(--cyan-dim)] px-3 py-2 text-[12px] font-semibold text-[var(--cyan)]"
                  style={{ opacity: highlightedRoute === 'ai' ? 1 : 0.6 }}
                >
                  AI-ni göstər
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] text-[var(--text-2)]">Standart marşrut</p>
                <p className="text-[13px] text-[var(--text-1)]">
                  {routeResult.distance} • {routeResult.duration}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onComputeAiRoute()}
                disabled={aiAltLoading || !fromAddress || !toAddress}
                className="rounded-[var(--r-md)] border border-[var(--cyan)] bg-[var(--cyan-dim)] px-4 py-2 text-[13px] font-semibold text-[var(--cyan)] disabled:opacity-60"
              >
                {aiAltLoading ? 'Hesaplanır...' : '🤖 AI Marşrutu'}
              </button>
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        style={{ position: 'fixed', bottom: '144px', right: '20px', zIndex: 1000 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cyan)] text-[var(--navy)] shadow-lg"
        aria-label="Mövqeyim"
        onClick={flyToMyLocation}
      >
        <Navigation className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
      </button>

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
