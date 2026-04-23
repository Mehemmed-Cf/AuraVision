/**
 * React Native (Expo) — 3D-style barrier card.
 * Copy `src/lib/aura/inclusivityIndex.ts` logic into shared package or duplicate for mobile.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BarrierMeasurementsRN {
  height_mm: number;
  slope_degrees: number;
  width_cm: number;
}

export interface MockBarrierRN {
  id: string;
  type: string;
  confidence: number;
  measurements?: BarrierMeasurementsRN;
}

const IMPOSSIBLE_SLOPE = 10;

export function BarrierCard({ barrier }: { barrier: MockBarrierRN }) {
  const m = barrier.measurements ?? { height_mm: 0, slope_degrees: 0, width_cm: 100 };
  const impassable = m.slope_degrees > IMPOSSIBLE_SLOPE;

  return (
    <View style={[styles.card, impassable ? styles.cardBad : styles.cardOk]}>
      <View style={styles.row}>
        <Text style={styles.title}>{barrier.type}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Verified by AI ({barrier.confidence.toFixed(2)})</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        Slope {m.slope_degrees}° · Width {m.width_cm} cm · H {m.height_mm} mm
      </Text>
      {impassable ? <Text style={styles.warn}>Impassable — wheelchair (slope &gt; 10°)</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardOk: {
    backgroundColor: '#111827',
    borderColor: '#1e2d42',
  },
  cardBad: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.6)',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  title: { color: '#fff', fontWeight: '600', fontSize: 13 },
  badge: {
    borderWidth: 1,
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0,212,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#00d4ff', fontSize: 11 },
  meta: { color: '#8b9ab4', fontSize: 12, marginTop: 8 },
  warn: { color: '#ef4444', fontWeight: '600', marginTop: 8, fontSize: 13 },
});
