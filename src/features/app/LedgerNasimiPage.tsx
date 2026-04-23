import { auraMockDataset } from '@/lib/aura/mockDataset';
import { getLocalUserProfiles } from '@/lib/aura/userProfilesLocal';
import { BarrierCard3D } from '@/components/aura/BarrierCard3D';

export function LedgerNasimiPage() {
  const critical = auraMockDataset.barriers.filter((b) => b.status === 'critical');
  const avgAirScore =
    auraMockDataset.air_quality_nodes.reduce((s, n) => s + n.score, 0) /
    auraMockDataset.air_quality_nodes.length;

  /** Composite “debt” signal: critical count + gap from ideal air (100). */
  const accessibilityDebt = critical.length + (100 - avgAirScore) / 10;

  const sampleBarriers = auraMockDataset.barriers.filter((b) => b.measurements).slice(0, 3);

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-1)]">B2G — Nasimi rayonu</h1>
        <p className="mt-1 text-[14px] text-[var(--text-2)]">{auraMockDataset.district_focus}</p>
        <p className="mt-2 text-[12px] text-[var(--text-3)]">
          Privacy: user profilləri yalnız cihazda saxlanılır; mock backend-ə göndərilmir. (Lokal nümunə:{' '}
          {getLocalUserProfiles().length} profil)
        </p>
      </div>

      <div className="overflow-x-auto rounded-[var(--r-md)] border border-[var(--navy-border)]">
        <table className="w-full min-w-[320px] text-left text-[14px]">
          <thead className="border-b border-[var(--navy-border)] bg-[var(--navy-raised)] text-[12px] uppercase text-[var(--text-3)]">
            <tr>
              <th className="px-4 py-3">Göstərici</th>
              <th className="px-4 py-3">Dəyər</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-1)]">
            <tr className="border-b border-[var(--navy-border)]">
              <td className="px-4 py-3 text-[var(--text-2)]">Kritik maneə sayı</td>
              <td className="px-4 py-3 font-semibold text-[var(--error)]">{critical.length}</td>
            </tr>
            <tr className="border-b border-[var(--navy-border)]">
              <td className="px-4 py-3 text-[var(--text-2)]">Ortalama hava keyfiyyəti (0–100)</td>
              <td className="px-4 py-3 font-semibold text-[var(--cyan)]">{avgAirScore.toFixed(1)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-[var(--text-2)]">Accessibility debt (təxmini)</td>
              <td className="px-4 py-3 font-semibold text-[var(--warning)]">{accessibilityDebt.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-3 text-[16px] font-semibold text-[var(--text-1)]">3D maneə kartları (nümunə)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleBarriers.map((b) => (
            <BarrierCard3D key={b.id} barrier={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
