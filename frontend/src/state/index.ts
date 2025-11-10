import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    set => ({
      user: null,
      isAuthenticated: false,
      setUser: user => set({ user }),
      setAuthenticated: isAuthenticated => set({ isAuthenticated }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    set => ({
      sidebarOpen: false,
      theme: 'light',
      setSidebarOpen: open => set({ sidebarOpen: open }),
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'ui-store',
    }
  )
);
