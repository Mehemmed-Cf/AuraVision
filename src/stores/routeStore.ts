import { create } from 'zustand';

export interface RouteOptions {
  from: string;
  to: string;
  profile: string;
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
    await delay(1500);

    const barrierCount = 2 + (opts.from.length + opts.to.length) % 4;
    const accessibilityScore = 72 + (opts.profile.length % 20);
    const airQualityIndex = 68 + (opts.from.length % 15);
    const inclusivityIndex = Math.round(
      (accessibilityScore * airQualityIndex) / Math.max(1, barrierCount * 10),
    );

    const waypoints: [number, number][] = [
      [40.4093, 49.8671],
      [40.415, 49.875],
      [40.42, 49.88],
      [40.425, 49.87],
    ];

    const warnings: string[] =
      barrierCount > 2
        ? ['Yüksək səki zonası aşkarlandı', 'Lift müvəqqəti qapalı ola bilər']
        : ['Marşrut əlçatanlıq üçün yoxlanılıb'];

    const result: CalculatedRoute = {
      distance: `${2.4 + (opts.to.length % 5) * 0.8} km`,
      duration: `${12 + (opts.from.length % 8)} dəq`,
      inclusivityIndex: Math.min(100, inclusivityIndex),
      accessibilityScore,
      airQualityIndex,
      barrierCount,
      waypoints,
      warnings,
    };

    set({ isLoading: false, lastResult: result, error: null });
    return result;
  },
}));
