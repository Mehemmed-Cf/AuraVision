import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Check, MapPin } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { BARRIER_TYPE_LABEL, type BarrierType } from '@/stores/mapStore';
import { useMapStore } from '@/stores/mapStore';
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

export function ReportPage() {
  const addReport = useMapStore((s) => s.addReport);
  const incrementReports = useAuthStore((s) => s.incrementReportsSubmitted);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [inclusivity, setInclusivity] = useState(0);

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

  const onDrop = useCallback((f: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFileName(f.name);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const mockLocation = () => {
    setValue('lat', 40.41 + Math.random() * 0.01);
    setValue('lng', 49.86 + Math.random() * 0.02);
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
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-3)]" />
                <input
                  className="w-full rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[rgba(255,255,255,0.05)] py-2.5 pl-10 pr-3 text-[15px] text-[var(--text-1)]"
                  aria-label="Ünvan"
                  aria-describedby={errors.address ? 'addr-err' : undefined}
                  {...register('address')}
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
          </div>

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
                <img src={preview} alt="" className="max-h-48 rounded-[var(--r-md)] object-contain" />
              ) : (
                <span className="text-[14px] text-[var(--text-2)]">Sürüşdürüb buraxın və ya seçin</span>
              )}
              {fileName ? <span className="mt-2 text-[12px] text-[var(--text-3)]">{fileName}</span> : null}
            </label>
          </div>

          <div>
            <label className="mb-1 block text-[13px] text-[var(--text-2)]">Təsvir</label>
            <textarea
              rows={4}
              className="w-full rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-[15px] text-[var(--text-1)]"
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
