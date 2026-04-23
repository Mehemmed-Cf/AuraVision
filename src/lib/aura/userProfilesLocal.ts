/**
 * Privacy-by-design: user_profiles_local is loaded from bundled local data only.
 * Do not POST these objects to any API — keep processing on-device.
 */
import type { UserProfileLocal } from '@/types/auraMock';
import { auraMockDataset } from '@/lib/aura/mockDataset';

export function getLocalUserProfiles(): readonly UserProfileLocal[] {
  return auraMockDataset.user_profiles_local;
}
