import mock from '../data/mockdatas.json';

export default function DashboardPage() {
  const critical = mock.barriers.filter((b) => b.status === 'critical');
  const avgAir =
    mock.air_quality_nodes.reduce((s, n) => s + n.score, 0) / mock.air_quality_nodes.length;
  const accessibilityDebt = critical.length + (100 - avgAir) / 10;

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 22 }}>B2G — Nasimi rayonu</h1>
      <p style={{ color: '#8b9ab4', marginTop: 8 }}>{mock.district_focus}</p>
      <table
        style={{
          width: '100%',
          marginTop: 24,
          borderCollapse: 'collapse',
          border: '1px solid #1e2d42',
        }}
      >
        <thead>
          <tr style={{ background: '#1a2332', textAlign: 'left' }}>
            <th style={{ padding: 12, fontSize: 12 }}>Göstərici</th>
            <th style={{ padding: 12, fontSize: 12 }}>Dəyər</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderTop: '1px solid #1e2d42' }}>
            <td style={{ padding: 12, color: '#8b9ab4' }}>Kritik maneə sayı</td>
            <td style={{ padding: 12, color: '#ef4444', fontWeight: 600 }}>{critical.length}</td>
          </tr>
          <tr style={{ borderTop: '1px solid #1e2d42' }}>
            <td style={{ padding: 12, color: '#8b9ab4' }}>Ortalama hava keyfiyyəti (0–100)</td>
            <td style={{ padding: 12, color: '#00d4ff', fontWeight: 600 }}>{avgAir.toFixed(1)}</td>
          </tr>
          <tr style={{ borderTop: '1px solid #1e2d42' }}>
            <td style={{ padding: 12, color: '#8b9ab4' }}>Accessibility debt (təxmini)</td>
            <td style={{ padding: 12, color: '#f59e0b', fontWeight: 600 }}>{accessibilityDebt.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
