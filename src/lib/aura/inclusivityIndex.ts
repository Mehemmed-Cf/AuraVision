import type { BarrierMeasurements, MockBarrier } from '@/types/auraMock';

/** Steepness threshold (degrees) above which accessibility is penalized. */
export const STEEP_SLOPE_DEG = 8;

/** Wide sidewalk threshold (cm) — presence bonus. */
export const WIDE_SIDEWALK_CM = 120;

/**
 * Weighted barrier denominator: broken_ramp penalized more than high_curb.
 * Falls back to mock `penalty_weight` when type not listed.
 */
export const BARRIER_TYPE_WEIGHT: Record<string, number> = {
  broken_ramp: 10,
  high_curb: 5,
  steep_slope: 7,
  blocked_sidewalk: 8,
  missing_tactile_paving: 4,
  narrow_passage: 6,
  construction_zone: 10,
  uneven_pavement: 5,
  stair_only_entry: 10,
  flooded_path: 9,
  loose_gravel: 3,
  steep_ramp: 10,
  no_crosswalk: 7,
  obstructed_ramp: 8,
  broken_elevator_access: 10,
  slippery_surface: 4,
  low_visibility_zone: 5,
  temporary_event_block: 6,
  damaged_sidewalk_edge: 5,
  missing_ramp_transition: 9,
};

const DEFAULT_MEASUREMENTS: BarrierMeasurements = {
  height_mm: 0,
  slope_degrees: 0,
  width_cm: 100,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Accessibility ∈ [0,100]: penalize slopes > STEEP_SLOPE_DEG, reward width ≥ WIDE_SIDEWALK_CM.
 */
export function accessibilityFromMeasurements(m: BarrierMeasurements): number {
  let score = 100;
  if (m.slope_degrees > STEEP_SLOPE_DEG) {
    score -= Math.min(45, (m.slope_degrees - STEEP_SLOPE_DEG) * 4);
  }
  if (m.width_cm < 90) {
    score -= (90 - m.width_cm) * 0.35;
  }
  if (m.width_cm >= WIDE_SIDEWALK_CM) {
    score += 6;
  }
  return clamp(score, 0, 100);
}

/**
 * Normalized air quality 0–100 from PM2.5 (µg/m³) and NO2 (µg/m³).
 * Lower pollution → higher score (simple bounded inverse).
 */
export function airQualityFromPmNo2(pm25: number, no2: number): number {
  const pmPart = clamp(100 - pm25 * 2.2, 0, 100);
  const no2Part = clamp(100 - no2 * 1.8, 0, 100);
  return clamp((pmPart + no2Part) / 2, 0, 100);
}

export function barrierWeight(b: MockBarrier): number {
  const byType = BARRIER_TYPE_WEIGHT[b.type];
  if (byType !== undefined) return byType;
  return b.penalty_weight;
}

/** Sum of weighted barrier penalties (minimum epsilon to avoid divide-by-zero). */
export function weightedBarrierSum(barriers: MockBarrier[]): number {
  const sum = barriers.reduce((acc, b) => acc + barrierWeight(b), 0);
  return Math.max(0.5, sum);
}

/**
 * Inclusivity Index: I = (Accessibility × AirQuality) / Barriers
 * Barriers = weighted penalty sum.
 */
export function computeInclusivityIndex(
  accessibility: number,
  airQuality: number,
  barriersWeightedSum: number,
): number {
  return (accessibility * airQuality) / barriersWeightedSum;
}

export function measurementsOrDefault(b: MockBarrier): BarrierMeasurements {
  return b.measurements ?? DEFAULT_MEASUREMENTS;
}
