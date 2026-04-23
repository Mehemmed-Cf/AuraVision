import { Navigate } from 'react-router-dom';
import { LandingPage } from '@/features/marketing/LandingPage';
import { useAuthStore } from '@/stores/authStore';

/** Public marketing home, or dashboard when already signed in. */
export function HomeRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
}
