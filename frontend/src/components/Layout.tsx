import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Layout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, error, clearError } = useAuth();

  const navItems = [
    { path: '/search', label: 'Search' },
    { path: '/matches', label: 'Matches' },
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">App</h1>
              {isAuthenticated && user && (
                <span className="hidden sm:inline-flex text-sm text-gray-500">
                  Welcome back, <span className="ml-1 font-medium text-gray-700">{user.username}</span>
                </span>
              )}
            </div>
            <div className="hidden md:flex space-x-8">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline text-sm"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <NavLink to="/login" className="btn btn-outline text-sm">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="btn btn-primary text-sm">
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
        {error && (
          <div className="border-t border-red-200 bg-red-50">
            <div className="container flex items-center justify-between py-2">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={clearError}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="container py-8 flex-1 w-full">{children}</main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
