import type { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M17.66,11.2C17.43,10.9 17.15,10.64 16.89,10.38C16.22,9.78 15.46,9.35 14.82,8.72C13.33,7.26 13,4.85 13.95,3C13,3.23 12.17,3.75 11.46,4.32C8.87,6.4 7.85,10.07 9.07,13.22C9.11,13.32 9.15,13.42 9.15,13.55C9.15,13.77 9,13.97 8.8,14.05C8.57,14.15 8.33,14.09 8.14,13.93C8.08,13.88 8.04,13.83 8,13.76C6.87,12.33 6.69,10.28 7.45,8.64C5.78,10 4.87,12.3 5,14.47C5.06,14.97 5.12,15.47 5.29,15.97C5.43,16.57 5.7,17.17 6,17.7C7.08,19.43 8.95,20.67 10.96,20.92C13.1,21.19 15.39,20.8 17.03,19.32C18.86,17.66 19.5,15 18.56,12.72L18.43,12.46C18.22,12 17.66,11.2 17.66,11.2M14.5,17.5C14.22,17.74 13.76,18 13.4,18.1C12.28,18.5 11.16,17.94 10.5,17.28C11.69,17 12.4,16.12 12.61,15.23C12.78,14.43 12.46,13.77 12.33,13C12.21,12.26 12.23,11.63 12.5,10.94C12.69,11.32 12.89,11.7 13.13,12C13.9,13 15.11,13.44 15.37,14.8C15.41,14.94 15.43,15.08 15.43,15.23C15.46,16.05 15.1,16.95 14.5,17.5H14.5Z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m6-12l-5.2 3M6.8 12 1 15m11-14 5.2 3M17.2 12l5.2 3m-11 4-5.2-3M6.8 12 1 9m11 14 5.2-3M17.2 12l5.2-3" />
  </svg>
);

const Layout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, error, clearError } = useAuth();

  const navItems = [
    { path: '/search', label: 'Discover', icon: FlameIcon },
    { path: '/matches', label: 'Matches', icon: HeartIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-primary-500">
                <FlameIcon />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-tinder-orange bg-clip-text text-transparent">
                tinder
              </h1>
            </div>
            
            {isAuthenticated && user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <span>👋</span>
                <span className="font-medium text-gray-800">{user.username}</span>
              </div>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:block btn btn-outline text-xs px-4 py-2"
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
          <div className="container flex items-center justify-between py-3 px-4">
            <p className="text-sm font-medium">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="text-white/90 hover:text-white font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full py-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-tinder-xl z-50">
          <div className="container">
            <div className="flex justify-around items-center py-3">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <NavLink
                    key={path}
                    to={path}
                    className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'text-primary-500'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                      <Icon />
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-primary-500' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
