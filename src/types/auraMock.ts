/** Typed shapes for AURA mock data (mockdatas.json). */

export type BarrierType =
  | 'high_curb'
  | 'broken_ramp'
  | 'steep_slope'
  | 'blocked_sidewalk'
  | 'missing_tactile_paving'
  | 'narrow_passage'
  | 'construction_zone'
  | 'uneven_pavement'
  | 'stair_only_entry'
  | 'flooded_path'
  | 'loose_gravel'
  | 'steep_ramp'
  | 'no_crosswalk'
  | 'obstructed_ramp'
  | 'broken_elevator_access'
  | 'slippery_surface'
  | 'low_visibility_zone'
  | 'temporary_event_block'
  | 'damaged_sidewalk_edge'
  | 'missing_ramp_transition';

export type BarrierStatus = 'reported' | 'verified' | 'critical';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BarrierMeasurements {
  height_mm: number;
  slope_degrees: number;
  width_cm: number;
}

export interface MockBarrier {
  id: string;
  type: BarrierType | string;
  location: LatLng;
  measurements?: BarrierMeasurements;
  confidence: number;
  status: BarrierStatus | string;
  penalty_weight: number;
}

export interface AirQualityNode {
  node_id: string;
  location: LatLng;
  pm2_5: number;
  pm10: number;
  no2: number;
  score: number;
}

export interface UserProfileLocal {
  id: string;
  type: string;
  constraints: Record<string, unknown>;
}

export interface RouteCandidate {
  route_id: string;
  distance_m: number;
  time_min: number;
  score: number;
}

export interface RouteSegment {
  id: string;
  barriers: number;
  air_score: number;
  access: number;
  inclusivity: number;
}

export interface AuraAlert {
  id: string;
  type: string;
  severity: string;
}

export interface AuraMockDataset {
  project: string;
  district_focus: string;
  generated_at: string;
  barriers: MockBarrier[];
  air_quality_nodes: AirQualityNode[];
  user_profiles_local: UserProfileLocal[];
  route_candidates: RouteCandidate[];
  route_segments: RouteSegment[];
  alerts: AuraAlert[];
}
