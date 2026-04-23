import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/features/app/DashboardPage';
import { LastMeterMapPage } from '@/features/app/LastMeterMapPage';
import { LedgerNasimiPage } from '@/features/app/LedgerNasimiPage';
import { MapPage } from '@/features/app/MapPage';
import { ProfilePage } from '@/features/app/ProfilePage';
import { ReportPage } from '@/features/app/ReportPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { HomeRoute } from '@/routes/HomeRoute';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

function AuthAnimatedLayout() {
  const location = useLocation();
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="min-h-screen"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthAnimatedLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ledger" element={<LedgerNasimiPage />} />
          <Route path="/last-meter" element={<LastMeterMapPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
