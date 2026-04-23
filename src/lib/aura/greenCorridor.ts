import type { LatLng, MockBarrier } from '@/types/auraMock';

/** Minimum distance (approx. degrees) from a reported barrier center to the corridor polyline. */
const REPORTED_BUFFER = 0.00035;

function offsetPerpendicular(from: LatLng, to: LatLng, dist: number): LatLng {
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return { lat: from.lat + nx * dist, lng: from.lng + ny * dist };
}

function distPointToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const px = p.lng;
  const py = p.lat;
  const x1 = a.lng;
  const y1 = a.lat;
  const x2 = b.lng;
  const y2 = b.lat;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1e-12)));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  return Math.hypot(px - qx, py - qy);
}

/**
 * Builds a polyline [start, …, end] that stays away from `reported` barriers (status === reported).
 * Maximizes inclusivity heuristically by detouring when a straight segment is too close.
 */
export function buildGreenCorridor(
  start: LatLng,
  end: LatLng,
  barriers: MockBarrier[],
): LatLng[] {
  const reported = barriers.filter((b) => b.status === 'reported');
  const mid: LatLng = {
    lat: (start.lat + end.lat) / 2,
    lng: (start.lng + end.lng) / 2,
  };

  let tooClose = false;
  for (const b of reported) {
    if (distPointToSegment(b.location, start, end) < REPORTED_BUFFER) {
      tooClose = true;
      break;
    }
  }

  if (!tooClose) return [start, end];

  const detour = offsetPerpendicular(mid, end, 0.00055);
  let secondLegBad = false;
  for (const b of reported) {
    if (distPointToSegment(b.location, detour, end) < REPORTED_BUFFER * 0.9) {
      secondLegBad = true;
      break;
    }
  }
  if (!secondLegBad) return [start, detour, end];

  const detour2 = offsetPerpendicular(mid, end, -0.00055);
  return [start, detour, detour2, end];
}

/** Pick route candidate with highest inclusivity-related score (mock). */
export function bestRouteCandidateId(
  candidates: { route_id: string; score: number }[],
): string | null {
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => b.score - a.score)[0]!.route_id;
}
