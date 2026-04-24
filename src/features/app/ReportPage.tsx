import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Camera, Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AddressAutocomplete } from '@/components/location/AddressAutocomplete';
import type { AddressSuggestion } from '@/services/locationService';
import { useAuthStore } from '@/stores/authStore';
import { BARRIER_TYPE_LABEL, type BarrierType } from '@/stores/mapStore';
import { useMapStore } from '@/stores/mapStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { reportFormSchema, type ReportFormValues } from './reportSchema';

const TYPES: BarrierType[] = [
  'broken_ramp',
  'high_curb',
  'closed_elevator',
  'poor_surface',
  'no_ramp',
];

const SEVERITY: { v: ReportFormValues['severity']; label: string; color: string }[] = [
  { v: 'low', label: 'Aşağı', color: 'var(--success)' },
  { v: 'medium', label: 'Orta', color: 'var(--warning)' },
  { v: 'high', label: 'Yüksək', color: 'var(--error)' },
];

const YOLO_DETECTIONS = [
  {
    type: 'broken_ramp' as const,
    severity: 'high' as const,
    confidence: 94,
    description: 'Sınıq pandus aşkarlandı. Səth ciddi şəkildə zədələnib.',
  },
  {
    type: 'high_curb' as const,
    severity: 'medium' as const,
    confidence: 87,
    description: 'Hündür səki kənarı aşkarlandı. Əlil arabası üçün çətin.',
  },
  {
    type: 'poor_surface' as const,
    severity: 'medium' as const,
    confidence: 91,
    description: 'Pis səth vəziyyəti. Çatlar və kövrəklər mövcuddur.',
  },
  {
    type: 'no_ramp' as const,
    severity: 'high' as const,
    confidence: 89,
    description: 'Pandus yoxdur. Pilləkən alternativi təklif edilmir.',
  },
];

type YoloPick = (typeof YOLO_DETECTIONS)[number];

export function ReportPage() {
  const addReport = useMapStore((s) => s.addReport);
  const incrementReports = useAuthStore((s) => s.incrementReportsSubmitted);
  const addUploadReward = useRewardsStore((s) => s.addUploadReward);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutsRef = useRef<number[]>([]);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [inclusivity, setInclusivity] = useState(0);
  const [addressText, setAddressText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [yoloBadge, setYoloBadge] = useState<YoloPick | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: 'broken_ramp',
      severity: 'medium',
      address: '',
      description: '',
      lat: 40.4093,
      lng: 49.8671,
    },
  });

  const typeVal = watch('type');
  const sevVal = watch('severity');

  const clearScanTimeouts = useCallback(() => {
    scanTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    scanTimeoutsRef.current = [];
  }, []);

  useEffect(() => () => clearScanTimeouts(), [clearScanTimeouts]);

  const onDrop = useCallback((f: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setYoloBadge(null);
  }, []);

  const runYoloScan = useCallback(
    (file: File) => {
      clearScanTimeouts();
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setYoloBadge(null);
      setScanning(true);
      setScanStatus('Şəkil analiz edilir...');

      const schedule = (fn: () => void, ms: number) => {
        const id = window.setTimeout(fn, ms);
        scanTimeoutsRef.current.push(id);
      };

      schedule(() => setScanStatus('Maneələr axtarılır...'), 800);
      schedule(() => setScanStatus('YOLOv8 modeli işləyir...'), 800 + 1200);
      schedule(() => setScanStatus('Nəticə hazırlanır...'), 800 + 1200 + 1000);
      schedule(() => {
        const pick = YOLO_DETECTIONS[Math.floor(Math.random() * YOLO_DETECTIONS.length)]!;
        setValue('type', pick.type, { shouldValidate: true });
        setValue('severity', pick.severity, { shouldValidate: true });
        setValue('description', pick.description, { shouldValidate: true });
        setYoloBadge(pick);
        setScanning(false);
        setScanStatus('');
      }, 3800);
    },
    [clearScanTimeouts, setValue],
  );

  const onCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    runYoloScan(file);
  };

  const mockLocation = () => {
    setValue('lat', 40.41 + Math.random() * 0.01);
    setValue('lng', 49.86 + Math.random() * 0.02);
  };

  const onAddressSelect = (selection: AddressSuggestion) => {
    setAddressText(selection.displayName);
    setValue('address', selection.displayName, { shouldValidate: true });
    setValue('lat', selection.lat);
    setValue('lng', selection.lng);
  };

  const onSubmit = (data: ReportFormValues) => {
    const score = 40 + Math.floor(Math.random() * 50);
    addReport({
      lat: data.lat,
      lng: data.lng,
      type: data.type,
      severity: data.severity,
      address: data.address,
      description: data.description,
      imageUrl: preview ?? `https://picsum.photos/300/200?random=${Date.now()}`,
      inclusivityScore: score,
    });
    setInclusivity(score);
    incrementReports();
    if (preview) {
      addUploadReward();
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--cyan)] bg-[var(--cyan-dim)]"
        >
          <Check className="h-14 w-14 text-[var(--cyan)]" strokeWidth={3} aria-hidden="true" />
        </motion.div>
        <h2 className="mt-4 text-center text-[20px] font-semibold text-[var(--text-1)]">
          Maneə bildirildi! Təşəkkür edirik.
        </h2>
        <p className="mt-2 text-[14px] text-[var(--text-2)]">İnkluzivlik indeksi (təxmini): {inclusivity}</p>
        <Link
          to="/map"
          className="mt-8 flex h-12 w-full max-w-xs items-center justify-center rounded-[var(--r-md)] bg-[var(--cyan)] font-semibold text-[var(--navy)]"
        >
          Xəritəyə Bax
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-lg rounded-[var(--r-lg)] border border-[var(--navy-border)] bg-[var(--navy-card)] p-6">
        <h1 className="mb-6 text-[22px] font-semibold text-[var(--text-1)]">Maneə bildirin</h1>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <p className="mb-2 text-[13px] text-[var(--text-2)]">Maneə növü</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={[
                    'rounded-[var(--r-md)] border px-3 py-2 text-[12px]',
                    typeVal === t
                      ? 'border-[var(--cyan)] bg-[var(--cyan-dim)] text-[var(--cyan)]'
                      : 'border-[var(--navy-border)] bg-[var(--navy-raised)] text-[var(--text-2)]',
                  ].join(' ')}
                >
                  {BARRIER_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('type')} />
          </div>

          <div>
            <p className="mb-2 text-[13px] text-[var(--text-2)]">Ciddilik dərəcəsi</p>
            <div className="flex gap-2">
              {SEVERITY.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => setValue('severity', s.v)}
                  className={[
                    'flex-1 rounded-full border-2 py-2 text-[13px] font-medium',
                    sevVal === s.v ? 'border-[var(--cyan)] text-[var(--text-1)]' : 'border-[var(--navy-border)] text-[var(--text-2)]',
                  ].join(' ')}
                  style={sevVal === s.v ? { borderColor: s.color } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('severity')} />
          </div>

          <div>
            <label className="mb-1 block text-[13px] text-[var(--text-2)]">Ünvan</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative z-20 flex-1">
                <AddressAutocomplete
                  value={addressText}
                  onChange={(v) => {
                    setAddressText(v);
                    setValue('address', v, { shouldValidate: true });
                  }}
                  onSelect={onAddressSelect}
                  ariaLabel="Ünvan"
                  placeholder="Ünvan axtarın"
                />
              </div>
              <button
                type="button"
                onClick={mockLocation}
                className="shrink-0 rounded-[var(--r-md)] border border-[var(--navy-border)] px-3 py-2 text-[13px] text-[var(--cyan)]"
              >
                Mənim yerimi istifadə et
              </button>
            </div>
            {errors.address ? (
              <p id="addr-err" className="mt-1 text-[12px] text-[var(--error)]" role="alert">
                {errors.address.message}
              </p>
            ) : null}
            <input type="hidden" {...register('address')} />
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onCameraChange}
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--r-md)] border-2 border-[var(--cyan)] bg-transparent text-[15px] font-semibold text-[var(--cyan)] transition-colors hover:bg-[var(--cyan-dim)]"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            Kamera ilə Tara
          </button>

          <div>
            <p className="mb-2 text-[13px] text-[var(--text-2)]">Şəkil əlavə et</p>
            <label
              className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--r-lg)] border-2 border-dashed border-[var(--navy-border)] bg-[var(--navy-raised)] px-4 py-10 text-center transition-colors hover:border-[var(--cyan)] hover:bg-[var(--cyan-dim)]"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onDrop(e.target.files?.[0] ?? null)}
              />
              {preview ? (
                <div className="relative w-full max-w-md">
                  <img src={preview} alt="" className="max-h-48 w-full rounded-[var(--r-md)] object-contain" />
                  {scanning ? (
                    <div className="absolute inset-0 overflow-hidden rounded-[var(--r-md)] bg-[rgba(10,14,26,0.35)]">
                      <div className="aura-scan-line" />
                      <p className="absolute bottom-2 left-0 right-0 text-center text-[13px] font-medium text-[var(--cyan)]">
                        {scanStatus}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <span className="text-[14px] text-[var(--text-2)]">Sürüşdürüb buraxın və ya seçin</span>
              )}
              {fileName ? <span className="mt-2 text-[12px] text-[var(--text-3)]">{fileName}</span> : null}
            </label>
          </div>

          {yoloBadge ? (
            <div className="flex items-center gap-2 rounded-[var(--r-md)] bg-[var(--cyan)] px-3 py-2.5 text-[13px] font-medium text-[var(--navy)]">
              <Check className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              <span>
                YOLOv8 aşkarladı: {BARRIER_TYPE_LABEL[yoloBadge.type]} — {yoloBadge.confidence}% dəqiqliklə
              </span>
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-[13px] text-[var(--text-2)]">Təsvir</label>
            <textarea
              rows={4}
              className="w-full rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] px-3 py-2.5 text-[15px] text-[var(--text-1)]"
              aria-describedby={errors.description ? 'desc-err' : undefined}
              {...register('description')}
            />
            {errors.description ? (
              <p id="desc-err" className="mt-1 text-[12px] text-[var(--error)]" role="alert">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <input type="hidden" {...register('lat', { valueAsNumber: true })} />
          <input type="hidden" {...register('lng', { valueAsNumber: true })} />

          <button
            type="submit"
            className="h-12 w-full rounded-[var(--r-md)] bg-[var(--cyan)] text-[15px] font-semibold text-[var(--navy)]"
          >
            Bildir
          </button>
        </form>
      </div>
    </div>
  );
}
