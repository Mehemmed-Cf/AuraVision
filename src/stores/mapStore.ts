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

export interface ProfileRoad {
  id: string;
  name: string;
  recommendedFor: MobilityProfile[];
  surface: 'smooth' | 'mixed' | 'rough';
  lighting: 'good' | 'moderate' | 'low';
  slope: 'flat' | 'moderate' | 'steep';
  points: [number, number][];
}

const CENTER = { lat: 40.4093, lng: 49.8671 };

function seedReports(): BarrierReport[] {
  const samples: Array<{
    latOffset: number;
    lngOffset: number;
    type: BarrierType;
    severity: BarrierSeverity;
    address: string;
    description: string;
  }> = [
    { latOffset: 0.0028, lngOffset: 0.0039, type: 'high_curb', severity: 'high', address: '28 May metrosu, əsas çıxış', description: 'Səki hündürlüyü əlil arabası üçün keçidi çətinləşdirir.' },
    { latOffset: 0.0043, lngOffset: 0.0018, type: 'poor_surface', severity: 'medium', address: 'Səməd Vurğun bağı ətrafı', description: 'Səth çatlaq və qeyri-bərabərdir, titrəmə yaradır.' },
    { latOffset: 0.0052, lngOffset: -0.0022, type: 'closed_elevator', severity: 'high', address: 'Sahil m/st yeraltı keçid', description: 'Lift 2 gündür işlək deyil.' },
    { latOffset: 0.0031, lngOffset: -0.0056, type: 'broken_ramp', severity: 'high', address: 'Nizami küç. 74', description: 'Rampa kənarı qırılıb, təhlükəli eniş var.' },
    { latOffset: 0.0009, lngOffset: -0.0064, type: 'no_ramp', severity: 'medium', address: 'Fəvvarələr meydanı yan keçid', description: 'Keçiddə rampa ümumiyyətlə yoxdur.' },
    { latOffset: -0.0014, lngOffset: -0.0048, type: 'high_curb', severity: 'medium', address: 'Tarqovu, Nigar Rəfibəyli küç.', description: 'Küncdə səki hündürdür, uşaq arabası ilə eniş çətindir.' },
    { latOffset: -0.0034, lngOffset: -0.0031, type: 'poor_surface', severity: 'low', address: 'İçərişəhər qapısı yaxınlığı', description: 'Daş səth sürüşkən ola bilər.' },
    { latOffset: -0.0045, lngOffset: -0.0007, type: 'no_ramp', severity: 'high', address: 'Elmlər Akademiyası m/st çıxışı', description: 'Alternativ rampalı giriş göstərilmir.' },
    { latOffset: -0.0049, lngOffset: 0.0029, type: 'closed_elevator', severity: 'medium', address: 'Gənclik m/st ticarət mərkəzi girişi', description: 'Lift tez-tez nasaz qalır.' },
    { latOffset: -0.0026, lngOffset: 0.0057, type: 'broken_ramp', severity: 'medium', address: 'Atatürk prospekti keçid', description: 'Rampa bucağı kəskindir və tutacaq yoxdur.' },
    { latOffset: 0.0006, lngOffset: 0.0062, type: 'poor_surface', severity: 'medium', address: 'Nərimanov parkı daxili yol', description: 'Yolun bir hissəsində dərin çuxurlar var.' },
    { latOffset: 0.0022, lngOffset: 0.0053, type: 'high_curb', severity: 'high', address: 'Azadlıq prospekti, dayanacaq önü', description: 'Avtobus dayanacağında təhlükəsiz eniş yoxdur.' },
    { latOffset: 0.0063, lngOffset: -0.0012, type: 'closed_elevator', severity: 'low', address: 'Xətai m/st körpü altı keçid', description: 'Lift işləyir, amma fasilələrlə dayanır.' },
    { latOffset: -0.0062, lngOffset: 0.0015, type: 'no_ramp', severity: 'medium', address: '8 Noyabr prospekti piyada keçidi', description: 'Səki keçidində rampa işarəsi yoxdur.' },
    { latOffset: -0.0011, lngOffset: 0.0072, type: 'broken_ramp', severity: 'low', address: 'Dənizkənarı bulvar, Muğam mərkəzi tərəf', description: 'Rampa örtüyü qismən aşınıb.' },
    { latOffset: 0.007, lngOffset: 0.0003, type: 'high_curb', severity: 'high', address: 'Neftçilər prospekti, piyada keçidi', description: 'Yol kənarı keçid kəskin səki ilə bağlanır.' },
    { latOffset: 0.0061, lngOffset: 0.0039, type: 'poor_surface', severity: 'low', address: 'Bulvar dairəvi velosiped yolu', description: 'Səth əsasən rahatdır, kiçik sınıqlar var.' },
    { latOffset: -0.0058, lngOffset: -0.0042, type: 'closed_elevator', severity: 'high', address: 'İnşaatçılar m/st keçid', description: 'Lift tam bağlıdır, alternativ yol uzaqdır.' },
    { latOffset: 0.0047, lngOffset: -0.0063, type: 'no_ramp', severity: 'high', address: 'Yasamal parkı üst keçid', description: 'Pilləkən var, amma rampa yoxdur.' },
    { latOffset: -0.0071, lngOffset: -0.0006, type: 'broken_ramp', severity: 'medium', address: 'Memar Əcəmi m/st bazar tərəfi', description: 'Rampa səthində çat var, təkər ilişə bilər.' },
    { latOffset: -0.0068, lngOffset: 0.0046, type: 'high_curb', severity: 'medium', address: 'Koroglu Rəhimov küçəsi', description: 'Səkiyə çıxış üçün əlavə kömək tələb olunur.' },
    { latOffset: 0.0017, lngOffset: -0.008, type: 'poor_surface', severity: 'high', address: 'Bayıl yolu, dəniz kənarı hissə', description: 'Səth çox kobuddur, vibrasiya yüksəkdir.' },
    { latOffset: -0.0028, lngOffset: 0.0081, type: 'closed_elevator', severity: 'medium', address: 'Nizami metrosu ticarət çıxışı', description: 'Lift növbəli rejimdə işləyir, gözləmə yaradır.' },
    { latOffset: 0.0082, lngOffset: -0.0028, type: 'no_ramp', severity: 'low', address: 'Tbilisi prospekti piyada xətti', description: 'Yaxın alternativ rampalı keçid mövcuddur.' },
  ];

  return samples.map((sample, i) => ({
    id: `seed-${i + 1}`,
    lat: CENTER.lat + sample.latOffset,
    lng: CENTER.lng + sample.lngOffset,
    type: sample.type,
    severity: sample.severity,
    address: sample.address,
    description: sample.description,
    reportedBy: 'İcma üzvü',
    votes: 4 + (i % 15),
    imageUrl: `https://picsum.photos/300/200?random=${i + 1}`,
    createdAt: new Date(Date.now() - (i + 1) * 43200000).toISOString(),
    inclusivityScore: 32 + (i * 7) % 62,
  }));
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

export const PROFILE_ROADS: ProfileRoad[] = [
  {
    id: 'road-wheelchair-1',
    name: 'Bulvar inkluziv xətti',
    recommendedFor: ['wheelchair', 'stroller', 'standard'],
    surface: 'smooth',
    lighting: 'good',
    slope: 'flat',
    points: [
      [40.4048, 49.8786],
      [40.4062, 49.8759],
      [40.408, 49.8727],
      [40.4102, 49.8698],
      [40.4124, 49.8669],
    ],
  },
  {
    id: 'road-wheelchair-2',
    name: 'Mərkəz rampalı keçid',
    recommendedFor: ['wheelchair', 'stroller'],
    surface: 'smooth',
    lighting: 'moderate',
    slope: 'moderate',
    points: [
      [40.4124, 49.8669],
      [40.4143, 49.8652],
      [40.4169, 49.8634],
      [40.4191, 49.8622],
    ],
  },
  {
    id: 'road-visual-1',
    name: 'Səsli keçid marşrutu',
    recommendedFor: ['visual', 'standard'],
    surface: 'mixed',
    lighting: 'good',
    slope: 'flat',
    points: [
      [40.4039, 49.8655],
      [40.4068, 49.8644],
      [40.4105, 49.8636],
      [40.4144, 49.8628],
      [40.4188, 49.8617],
    ],
  },
  {
    id: 'road-respiratory-1',
    name: 'Aşağı çirklənmə xətti',
    recommendedFor: ['respiratory', 'standard', 'stroller'],
    surface: 'smooth',
    lighting: 'moderate',
    slope: 'flat',
    points: [
      [40.4027, 49.8712],
      [40.4054, 49.8726],
      [40.4087, 49.8739],
      [40.4121, 49.8749],
      [40.4158, 49.8758],
    ],
  },
  {
    id: 'road-stroller-1',
    name: 'Ailə dostu piyada yolu',
    recommendedFor: ['stroller', 'wheelchair', 'standard'],
    surface: 'smooth',
    lighting: 'good',
    slope: 'moderate',
    points: [
      [40.4161, 49.8776],
      [40.4142, 49.8748],
      [40.4125, 49.872],
      [40.4106, 49.8694],
      [40.4094, 49.8667],
    ],
  },
];
