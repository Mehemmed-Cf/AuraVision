import { create } from 'zustand';
import type { MobilityProfile } from '@/stores/authStore';
import { PROFILE_ROADS } from '@/stores/mapStore';
import { computeRoute } from '@/services/routing/routeEngine';
import { useMapStore } from '@/stores/mapStore';

export interface RouteOptions {
  from: string;
  to: string;
  profile: MobilityProfile;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}

export interface CalculatedRoute {
  distance: string;
  duration: string;
  inclusivityIndex: number;
  accessibilityScore: number;
  airQualityIndex: number;
  barrierCount: number;
  avoidedBarriers: number;
  waypoints: [number, number][];
  alternativeWaypoints?: [number, number][];
  warnings: string[];
  profileRoadIds: string[];
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface RouteState {
  isLoading: boolean;
  lastResult: CalculatedRoute | null;
  error: string | null;
  calculateRoute: (opts: RouteOptions) => Promise<CalculatedRoute | null>;
  setAlternativeWaypoints: (waypoints: [number, number][]) => void;
  clearResult: () => void;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  isLoading: false,
  lastResult: null,
  error: null,

  clearResult: () => set({ lastResult: null, error: null }),

  calculateRoute: async (opts) => {
    set({ isLoading: true, error: null });
    await delay(1500);

    const allBarriers = useMapStore.getState().getAllReports();
    const engineResult = await computeRoute(
      {
        from: { lat: opts.fromLat, lng: opts.fromLng },
        to: { lat: opts.toLat, lng: opts.toLng },
        profile: opts.profile,
      },
      allBarriers,
    );

    if (!engineResult) {
      set({ isLoading: false, error: 'Marşrut tapılmadı', lastResult: null });
      return null;
    }

    const profileRoads = PROFILE_ROADS.filter((road) => road.recommendedFor.includes(opts.profile));
    const fallbackRoad = PROFILE_ROADS[0] ? [PROFILE_ROADS[0]] : [];
    const selectedRoads = (profileRoads.length > 0 ? profileRoads : fallbackRoad).slice(0, 2);

    const result: CalculatedRoute = {
      distance: engineResult.distance,
      duration: engineResult.duration,
      inclusivityIndex: Math.round(engineResult.inclusivityIndex),
      accessibilityScore: engineResult.accessibilityScore,
      airQualityIndex: engineResult.airQualityIndex,
      barrierCount: engineResult.barrierCount,
      avoidedBarriers: engineResult.avoidedBarriers,
      waypoints: engineResult.waypoints,
      warnings: engineResult.warnings,
      profileRoadIds: selectedRoads.map((r) => r.id),
    };

    set({ isLoading: false, lastResult: result, error: null });
    return result;
  },

  setAlternativeWaypoints: (waypoints) => {
    const current = get().lastResult;
    if (!current) return;
    set({ lastResult: { ...current, alternativeWaypoints: waypoints } });
  },
}));
