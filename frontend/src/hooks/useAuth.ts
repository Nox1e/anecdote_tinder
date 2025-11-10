import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/state';

export const useAuth = () =>
  useAuthStore(
    useShallow(state => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      initializing: state.initializing,
      loading: state.loading,
      error: state.error,
      hasHydrated: state.hasHydrated,
      hydrate: state.hydrate,
      login: state.login,
      register: state.register,
      logout: state.logout,
      clearError: state.clearError,
    }))
  );
