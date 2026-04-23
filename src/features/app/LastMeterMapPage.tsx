import { useMemo } from 'react';
import Map, { Layer, Marker, NavigationControl, Source } from 'react-map-gl/mapbox';
import { auraMockDataset } from '@/lib/aura/mockDataset';
import { buildGreenCorridor, bestRouteCandidateId } from '@/lib/aura/greenCorridor';
import { computeInclusivityIndex, weightedBarrierSum } from '@/lib/aura/inclusivityIndex';

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const ROUTE_START = auraMockDataset.air_quality_nodes[0]!.location;
const ROUTE_END = auraMockDataset.air_quality_nodes[1]!.location;

export function LastMeterMapPage() {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';

  const { lineGeoJson, inclusivityHint, bestRoute } = useMemo(() => {
    const barriers = auraMockDataset.barriers;
    const corridor = buildGreenCorridor(ROUTE_START, ROUTE_END, barriers);
    const coords = corridor.map((p) => [p.lng, p.lat] as [number, number]);
    const line = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: coords },
    };
    const reported = barriers.filter((b) => b.status === 'reported');
    const w = weightedBarrierSum(reported);
    const aq =
      auraMockDataset.air_quality_nodes.reduce((s, n) => s + n.score, 0) /
      auraMockDataset.air_quality_nodes.length;
    const access = 78;
    const i = computeInclusivityIndex(access, aq, w);
    const best = bestRouteCandidateId(auraMockDataset.route_candidates);
    return { lineGeoJson: line, inclusivityHint: i, bestRoute: best };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-124px)] flex-col">
      <div className="border-b border-[var(--navy-border)] px-4 py-3 text-[13px] text-[var(--text-2)]">
        <p>
          Green corridor (reported maneələrdən yayınma): inclusivity təxmini{' '}
          <span className="font-semibold text-[var(--cyan)]">{inclusivityHint.toFixed(1)}</span> · ən yaxşı marşrut:{' '}
          <span className="text-[var(--text-1)]">{bestRoute ?? '—'}</span>
        </p>
      </div>
      <div className="relative h-[min(70vh,560px)] w-full flex-1">
        <Map
          mapboxAccessToken={token}
          mapStyle={MAP_STYLE}
          initialViewState={{
            longitude: (ROUTE_START.lng + ROUTE_END.lng) / 2,
            latitude: (ROUTE_START.lat + ROUTE_END.lat) / 2,
            zoom: 13,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          <Source id="green-corridor" type="geojson" data={lineGeoJson}>
            <Layer
              id="green-line"
              type="line"
              paint={{
                'line-color': '#10b981',
                'line-width': 5,
                'line-opacity': 0.9,
              }}
            />
          </Source>
          {auraMockDataset.barriers.map((b) => (
            <Marker key={b.id} longitude={b.location.lng} latitude={b.location.lat} anchor="bottom">
              <div
                className="h-3 w-3 rounded-full border-2 border-white shadow"
                style={{
                  background:
                    b.status === 'reported' ? '#ef4444' : b.status === 'critical' ? '#f59e0b' : '#3b82f6',
                }}
                title={b.type}
              />
            </Marker>
          ))}
          {auraMockDataset.air_quality_nodes.map((n) => (
            <Marker key={n.node_id} longitude={n.location.lng} latitude={n.location.lat} anchor="center">
              <div className="rounded bg-[rgba(16,185,129,0.35)] px-1 text-[9px] text-emerald-200">AQ</div>
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  );
}
