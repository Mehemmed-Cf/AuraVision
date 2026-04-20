import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MobilityProfile } from '@/stores/authStore';

export type BarrierType =
  | 'broken_ramp'
  | 'high_curb'
  | 'closed_elevator'
  | 'poor_surface'
  | 'no_ramp';

export type BarrierSeverity = 'low' | 'medium' | 'high';

export interface BarrierReport {
  id: string;
  lat: number;
  lng: number;
  type: BarrierType;
  severity: BarrierSeverity;
  address: string;
  description: string;
  reportedBy: string;
  votes: number;
  imageUrl: string;
  createdAt: string;
  inclusivityScore: number;
}

const CENTER = { lat: 40.4093, lng: 49.8671 };

function seedReports(): BarrierReport[] {
  const types: BarrierType[] = [
    'broken_ramp',
    'high_curb',
    'closed_elevator',
    'poor_surface',
    'no_ramp',
    'broken_ramp',
    'high_curb',
    'poor_surface',
    'no_ramp',
    'closed_elevator',
    'broken_ramp',
    'high_curb',
    'poor_surface',
    'closed_elevator',
    'no_ramp',
    'broken_ramp',
  ];
  const severities: BarrierSeverity[] = [
    'high',
    'medium',
    'low',
    'medium',
    'high',
    'low',
    'high',
    'medium',
    'low',
    'medium',
    'high',
    'low',
    'medium',
    'low',
    'high',
  ];
  const addresses = [
    'Nizami küç. 1',
    '28 May, keçid',
    'Sahil metro çıxışı',
    'Fəvvarələr meydanı',
    'Nəsimi rayonu park',
    'Xətai prospekti',
    'Gənclik m/st',
    'Əcəmi m/st',
    'Dənizkənarı bulvar',
    'Bayıl yolu',
    'Azadlıq prospekti',
    'İnşaatçılar m/st',
    'Nizami m/st',
    'Elmlər Akademiyası',
    '8 Noyabr prospekti',
  ];

  return types.map((type, i) => {
    const angle = (i / 15) * Math.PI * 2;
    const r = 0.008 + (i % 4) * 0.0015;
    return {
      id: `seed-${i + 1}`,
      lat: CENTER.lat + Math.sin(angle) * r,
      lng: CENTER.lng + Math.cos(angle) * r * 1.1,
      type,
      severity: severities[i] ?? 'medium',
      address: addresses[i] ?? `Bakı, nöqtə ${i + 1}`,
      description:
        'Əlçatanlıq üçün maneə. Zəhmət olmasa diqqətli olun və alternativ marşrut seçin.',
      reportedBy: 'İcma üzvü',
      votes: 3 + (i % 12),
      imageUrl: `https://picsum.photos/300/200?random=${i + 1}`,
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      inclusivityScore: 35 + (i * 4) % 55,
    };
  });
}

const SEEDED = seedReports();

interface MapState {
  seededReports: BarrierReport[];
  submittedReports: BarrierReport[];
  activeProfile: MobilityProfile;
  setActiveProfile: (p: MobilityProfile) => void;
  getAllReports: () => BarrierReport[];
  getRecentReports: (n: number) => BarrierReport[];
  addReport: (report: Omit<BarrierReport, 'id' | 'votes' | 'createdAt' | 'reportedBy'>) => BarrierReport;
  voteReport: (id: string) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      seededReports: SEEDED,
      submittedReports: [],
      activeProfile: 'standard',

      setActiveProfile: (p) => set({ activeProfile: p }),

      getAllReports: () => {
        const { seededReports, submittedReports } = get();
        return [...submittedReports, ...seededReports];
      },

      getRecentReports: (n) => {
        const all = get().getAllReports();
        return [...all]
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, n);
      },

      addReport: (partial) => {
        const report: BarrierReport = {
          ...partial,
          id: `sub-${crypto.randomUUID()}`,
          votes: 0,
          createdAt: new Date().toISOString(),
          reportedBy: 'Siz',
        };
        set((s) => ({ submittedReports: [report, ...s.submittedReports] }));
        return report;
      },

      voteReport: (id) => {
        set((s) => {
          const bump = (list: BarrierReport[]) =>
            list.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r));
          return {
            seededReports: bump(s.seededReports),
            submittedReports: bump(s.submittedReports),
          };
        });
      },
    }),
    {
      name: 'aura-map',
      partialize: (s) => ({
        submittedReports: s.submittedReports,
        activeProfile: s.activeProfile,
      }),
    },
  ),
);

export const BAKU_CENTER: [number, number] = [CENTER.lat, CENTER.lng];

export const BARRIER_TYPE_LABEL: Record<BarrierType, string> = {
  broken_ramp: 'Sınıq rampa',
  high_curb: 'Yüksək səki',
  closed_elevator: 'Qapalı lift',
  poor_surface: 'Pis səth',
  no_ramp: 'Rampasız',
};

export const FILTER_CHIPS: { key: BarrierType | 'all'; label: string }[] = [
  { key: 'all', label: 'Hamısı' },
  { key: 'broken_ramp', label: 'Sınıq rampa' },
  { key: 'high_curb', label: 'Yüksək səki' },
  { key: 'closed_elevator', label: 'Qapalı lift' },
  { key: 'poor_surface', label: 'Pis səth' },
  { key: 'no_ramp', label: 'Rampasız' },
];
