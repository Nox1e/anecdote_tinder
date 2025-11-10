import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authService } from '@/services';
import { AuthError } from '@/services/auth';
import { AuthUser, LoginRequest, RegisterRequest } from '@/types/api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      initializing: false,
      loading: false,
      error: null,
      hasHydrated: false,

      hydrate: async () => {
        const { hasHydrated, initializing } = get();
        if (hasHydrated || initializing) {
          return;
        }

        set({ initializing: true, error: null });

        try {
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
        } catch {
          authService.clearSession();
          set({
            user: null,
            isAuthenticated: false,
          });
        } finally {
          set({ initializing: false, hasHydrated: true });
        }
      },

      login: async credentials => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return response.user;
        } catch (error) {
          const message = getErrorMessage(error, 'Unable to sign in');
          set({
            loading: false,
            error: message,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async payload => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(payload);
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return response.user;
        } catch (error) {
          const message = getErrorMessage(error, 'Unable to create account');
          set({
            loading: false,
            error: message,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        let errorMessage: string | null = null;
        try {
          await authService.logout();
        } catch (error) {
          errorMessage = getErrorMessage(error, 'Unable to sign out');
        }

        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: errorMessage,
        });
      },

      clearError: () => set({ error: null }),
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
