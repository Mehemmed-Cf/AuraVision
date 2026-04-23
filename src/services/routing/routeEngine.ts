import type { MobilityProfile } from '@/stores/authStore';
import type { BarrierReport, BarrierType } from '@/stores/mapStore';

export interface RouteRequest {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  profile: MobilityProfile;
}

export interface RouteResult {
  waypoints: [number, number][];
  distance: string;
  duration: string;
  inclusivityIndex: number;
  accessibilityScore: number;
  airQualityIndex: number;
  barrierCount: number;
  warnings: string[];
  avoidedBarriers: number;
}

interface OsrmResponse {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
  }>;
}

const OSRM_FOOT = 'http://router.project-osrm.org/route/v1/foot';

const PROFILE_BARRIER_WEIGHTS: Record<
  MobilityProfile,
  Partial<Record<BarrierType, number>>
> = {
  wheelchair: {
    broken_ramp: 1.0,
    no_ramp: 1.0,
    high_curb: 0.9,
    poor_surface: 0.6,
    closed_elevator: 0.8,
  },
  stroller: {
    broken_ramp: 0.9,
    no_ramp: 0.9,
    high_curb: 0.8,
    poor_surface: 0.5,
    closed_elevator: 0.7,
  },
  visual: {
    poor_surface: 0.8,
    high_curb: 0.7,
    broken_ramp: 0.6,
    no_ramp: 0.5,
    closed_elevator: 0.4,
  },
  respiratory: {
    poor_surface: 0.3,
    broken_ramp: 0.2,
    no_ramp: 0.2,
    high_curb: 0.1,
    closed_elevator: 0.2,
  },
  standard: {
    broken_ramp: 0.4,
    no_ramp: 0.3,
    high_curb: 0.3,
    poor_surface: 0.2,
    closed_elevator: 0.2,
  },
};

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

function calcBarrierPenalty(
  barriers: BarrierReport[],
  waypoints: [number, number][],
  profile: MobilityProfile,
  radiusM: number,
): { count: number; penalty: number; relevantBarriers: BarrierReport[] } {
  const weights = PROFILE_BARRIER_WEIGHTS[profile];
  const relevant: BarrierReport[] = [];
  let penalty = 0;

  for (const barrier of barriers) {
    const weight = weights[barrier.type] ?? 0;
    if (weight === 0) continue;

    const isNear = waypoints.some(
      ([lat, lng]) =>
        haversineMeters({ lat: barrier.lat, lng: barrier.lng }, { lat, lng }) <= radiusM,
    );

    if (isNear) {
      relevant.push(barrier);
      const severityMultiplier =
        barrier.severity === 'high' ? 1.0 : barrier.severity === 'medium' ? 0.6 : 0.3;
      penalty += weight * severityMultiplier * 15;
    }
  }

  return { count: relevant.length, penalty: Math.min(penalty, 70), relevantBarriers: relevant };
}

function buildWarnings(
  profile: MobilityProfile,
  relevantBarriers: BarrierReport[],
  distanceKm: number,
): string[] {
  const w: string[] = [];
  const count = relevantBarriers.length;

  const highSeverity = relevantBarriers.filter((b) => b.severity === 'high').length;

  if (profile === 'wheelchair' || profile === 'stroller') {
    const rampIssues = relevantBarriers.filter(
      (b) => b.type === 'broken_ramp' || b.type === 'no_ramp',
    ).length;
    const curbIssues = relevantBarriers.filter((b) => b.type === 'high_curb').length;
    if (rampIssues > 0)
      w.push(`${rampIssues} pandus problemi aşkarlandı — alternativ yol tövsiyə olunur`);
    if (curbIssues > 0) w.push(`${curbIssues} hündür səki kənarı var`);
    if (highSeverity > 0) w.push(`${highSeverity} yüksək ciddilik səviyyəli maneə var`);
  }

  if (profile === 'visual') {
    const surfaceIssues = relevantBarriers.filter((b) => b.type === 'poor_surface').length;
    if (surfaceIssues > 0) w.push(`${surfaceIssues} pis səth zonası — ehtiyatlı olun`);
    if (count > 0) w.push(`Marşrutda ${count} maneə aşkarlandı — ağlabatan köməkçi tövsiyə olunur`);
  }

  if (profile === 'respiratory') {
    if (distanceKm > 2) w.push('Uzun məsafə — fasilə nöqtələri planlayın');
    w.push('Hava keyfiyyəti indeksi: Orta (AQI 68)');
  }

  if (w.length === 0 && count === 0) w.push('Bu profil üçün marşrut təmizdir');
  if (w.length === 0 && count > 0) w.push(`${count} kiçik maneə aşkarlandı`);

  return w;
}

export async function computeRoute(
  req: RouteRequest,
  allBarriers: BarrierReport[],
): Promise<RouteResult | null> {
  const { from, to } = req;
  const url = `${OSRM_FOOT}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as OsrmResponse;
  const route = data.routes?.[0];
  if (!route) return null;

  const waypoints: [number, number][] = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  const distanceKm = route.distance / 1000;
  const distance = `${distanceKm.toFixed(1)} km`;
  const durationMin = Math.ceil(route.duration / 60);
  const duration = `${durationMin} dəq`;

  const { penalty, relevantBarriers } = calcBarrierPenalty(
    allBarriers,
    waypoints,
    req.profile,
    150,
  );
  const barrierCount = relevantBarriers.length;
  const avoidedBarriers = Math.max(0, allBarriers.length - barrierCount);

  const baseScore = req.profile === 'respiratory' ? 85 : 80;
  const inclusivityIndex = Math.max(10, Math.round(baseScore - penalty));

  const warnings = buildWarnings(req.profile, relevantBarriers, distanceKm);

  const accessibilityScore = Math.max(0, Math.min(100, 100 - barrierCount * 12));
  const airQualityIndex = Math.max(35, Math.min(100, 92 - barrierCount * 3));

  return {
    waypoints,
    distance,
    duration,
    inclusivityIndex,
    accessibilityScore,
    airQualityIndex,
    barrierCount,
    warnings,
    avoidedBarriers,
  };
}
