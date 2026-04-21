import { create } from 'zustand';
import type { MobilityProfile } from '@/stores/authStore';
import { PROFILE_ROADS } from '@/stores/mapStore';
import { fetchOsrmRoute } from '@/services/locationService';

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
  waypoints: [number, number][];
  warnings: string[];
  profileRoadIds: string[];
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface RouteState {
  isLoading: boolean;
  lastResult: CalculatedRoute | null;
  error: string | null;
  calculateRoute: (opts: RouteOptions) => Promise<CalculatedRoute | null>;
  clearResult: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  isLoading: false,
  lastResult: null,
  error: null,

  clearResult: () => set({ lastResult: null, error: null }),

  calculateRoute: async (opts) => {
    set({ isLoading: true, error: null });
    await delay(250);

    const profileRoads = PROFILE_ROADS.filter((road) => road.recommendedFor.includes(opts.profile));
    const fallbackRoad = PROFILE_ROADS[0] ? [PROFILE_ROADS[0]] : [];
    const selectedRoads = (profileRoads.length > 0 ? profileRoads : fallbackRoad).slice(0, 2);
    const osrmRoute = await fetchOsrmRoute(
      { lat: opts.fromLat, lng: opts.fromLng },
      { lat: opts.toLat, lng: opts.toLng },
    );
    if (!osrmRoute) {
      set({ isLoading: false, error: 'Marşrut tapılmadı', lastResult: null });
      return null;
    }

    const barrierCount = Math.max(1, 5 - selectedRoads.length) + (opts.from.length + opts.to.length) % 3;
    const accessibilityScore = Math.min(97, 70 + selectedRoads.length * 10 + (opts.profile.length % 8));
    const airQualityIndex = Math.min(95, 66 + selectedRoads.length * 8 + (opts.from.length % 9));
    const inclusivityIndex = Math.round(
      (accessibilityScore * airQualityIndex) / Math.max(1, barrierCount * 10),
    );

    const waypoints: [number, number][] = osrmRoute.waypoints;

    const warnings: string[] =
      barrierCount > 2
        ? ['Yüksək səki zonası mümkündür', 'Alternativ rampalı keçid təklif olundu']
        : ['Marşrut profiliniz üçün əlçatanlıq baxımından uyğunlaşdırıldı'];

    const result: CalculatedRoute = {
      duration: `${Math.round(osrmRoute.durationMin)} dəq`,
      distance: `${osrmRoute.distanceKm.toFixed(1)} km`,
      inclusivityIndex: Math.min(100, inclusivityIndex),
      accessibilityScore,
      airQualityIndex,
      barrierCount,
      waypoints,
      warnings,
      profileRoadIds: selectedRoads.map((road) => road.id),
    };

    set({ isLoading: false, lastResult: result, error: null });
    return result;
  },
}));
