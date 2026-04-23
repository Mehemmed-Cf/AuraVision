import type { MockBarrier } from '@/types/auraMock';
import { measurementsOrDefault } from '@/lib/aura/inclusivityIndex';

const IMPOSSIBLE_SLOPE = 10;

interface BarrierCard3DProps {
  barrier: MockBarrier;
}

export function BarrierCard3D({ barrier }: BarrierCard3DProps) {
  const m = measurementsOrDefault(barrier);
  const impassableWheelchair = m.slope_degrees > IMPOSSIBLE_SLOPE;

  return (
    <div
      className="rounded-[var(--r-lg)] border p-4 shadow-xl transition-transform"
      style={{
        background: impassableWheelchair ? 'rgba(239,68,68,0.12)' : 'var(--navy-card)',
        borderColor: impassableWheelchair ? 'rgba(239,68,68,0.6)' : 'var(--navy-border)',
        transform: 'perspective(900px) rotateX(4deg) rotateY(-3deg)',
        boxShadow: impassableWheelchair
          ? '0 18px 40px rgba(239,68,68,0.25)'
          : '0 18px 40px rgba(0,0,0,0.35)',
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-[var(--text-1)]">{barrier.type}</span>
        <span className="rounded-full border border-[var(--cyan)] bg-[var(--cyan-dim)] px-2 py-0.5 text-[11px] text-[var(--cyan)]">
          Verified by AI ({barrier.confidence.toFixed(2)})
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-[12px] text-[var(--text-2)]">
        <dt>Slope</dt>
        <dd className="text-[var(--text-1)]">{m.slope_degrees}°</dd>
        <dt>Width</dt>
        <dd className="text-[var(--text-1)]">{m.width_cm} cm</dd>
        <dt>Height</dt>
        <dd className="text-[var(--text-1)]">{m.height_mm} mm</dd>
      </dl>
      {impassableWheelchair ? (
        <p className="mt-3 text-[13px] font-semibold text-[var(--error)]">Impassable — wheelchair (slope &gt; 10°)</p>
      ) : null}
    </div>
  );
}
