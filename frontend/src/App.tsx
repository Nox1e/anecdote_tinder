import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SearchPage from '@/pages/SearchPage';
import MatchesPage from '@/pages/MatchesPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, initializing, hasHydrated } = useAuth();

  if (!hasHydrated || initializing) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-gray-500">Загружаем ваш аккаунт…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { hydrate, hasHydrated, initializing } = useAuth();

  useEffect(() => {
    if (!hasHydrated) {
      void hydrate();
    }
  }, [hydrate, hasHydrated]);

  if (!hasHydrated && initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-base text-gray-600">Загрузка…</span>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
