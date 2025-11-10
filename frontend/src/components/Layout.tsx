import { NavLink } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navItems = [
    { path: '/search', label: 'Search' },
    { path: '/matches', label: 'Matches' },
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">App</h1>
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
              <NavLink to="/login" className="btn btn-outline text-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary text-sm">
                Register
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-8">{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
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
