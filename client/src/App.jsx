import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingSkeleton from './components/LoadingSkeleton';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RecognitionFeed = lazy(() => import('./pages/RecognitionFeed'));
const SendAppreciation = lazy(() => import('./pages/SendAppreciation'));
const ManagerReviewQueue = lazy(() => import('./pages/ManagerReviewQueue'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RewardsCatalog = lazy(() => import('./pages/RewardsCatalog'));
const MyRedemptions = lazy(() => import('./pages/MyRedemptions'));
const AdminCatalogManager = lazy(() => import('./pages/AdminCatalogManager'));
const AdminRedemptionQueue = lazy(() => import('./pages/AdminRedemptionQueue'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function RouteFallback() {
  return <div className="min-h-screen bg-page p-8"><LoadingSkeleton className="mx-auto h-96 max-w-6xl" /></div>;
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/recognitions" element={<ProtectedRoute><RecognitionFeed /></ProtectedRoute>} />
        <Route path="/recognitions/send" element={<ProtectedRoute><SendAppreciation /></ProtectedRoute>} />
        <Route path="/recognitions/review" element={<ManagerReviewQueue />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><RewardsCatalog /></ProtectedRoute>} />
        <Route path="/redemptions" element={<ProtectedRoute><MyRedemptions /></ProtectedRoute>} />
        <Route path="/admin/catalog" element={<ProtectedRoute roles={['HR']}><AdminCatalogManager /></ProtectedRoute>} />
        <Route path="/admin/redemptions" element={<ProtectedRoute roles={['HR']}><AdminRedemptionQueue /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['HR']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
