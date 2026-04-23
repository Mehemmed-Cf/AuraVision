import { computeRoute } from '@/services/routing/routeEngine';
import { useMapStore } from '@/stores/mapStore';

const FROM = { lat: 40.3777, lng: 49.892 }; // Nizami küçəsi
const TO = { lat: 40.3707, lng: 49.9472 }; // Həzi Aslanov

const profiles = ['wheelchair', 'respiratory', 'visual', 'stroller', 'standard'] as const;

export async function runTests() {
  const barriers = useMapStore.getState().seededReports;

  console.log('=== AURA Route Engine Test ===');
  console.log('From: Nizami küçəsi → To: Həzi Aslanov\n');

  for (const profile of profiles) {
    const result = await computeRoute({ from: FROM, to: TO, profile }, barriers);
    if (!result) {
      console.log(`[${profile}] FAILED — null result`);
      continue;
    }
    console.log(`[${profile.toUpperCase()}]`);
    console.log(`  Inclusivity Index: ${result.inclusivityIndex}`);
    console.log(`  Barrier Count:     ${result.barrierCount}`);
    console.log(`  Distance:          ${result.distance}`);
    console.log(`  Duration:          ${result.duration}`);
    console.log(`  Warnings:          ${result.warnings.join(' | ')}`);
    console.log('');
  }
}
