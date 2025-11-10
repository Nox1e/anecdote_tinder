import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginPage from '../LoginPage';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth');

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

type AuthHookReturn = ReturnType<typeof useAuth>;

const createAuthState = (overrides: Partial<AuthHookReturn> = {}): AuthHookReturn => ({
  user: null,
  isAuthenticated: false,
  initializing: false,
  loading: false,
  error: null,
  hasHydrated: true,
  hydrate: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
  ...overrides,
});

const mockUseAuth = useAuth as unknown as vi.MockedFunction<typeof useAuth>;

describe('LoginPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mockUseAuth.mockReset();
  });

  it('shows validation errors when required fields are missing', async () => {
    const authState = createAuthState();
    mockUseAuth.mockImplementation(() => authState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(authState.login).not.toHaveBeenCalled();
  });

  it('submits credentials and navigates to search on success', async () => {
    const loginMock = vi.fn().mockResolvedValue({});
    const authState = createAuthState({ login: loginMock });
    mockUseAuth.mockImplementation(() => authState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    expect(navigateMock).toHaveBeenCalledWith('/search', { replace: true });
  });

  it('displays server errors returned from the auth store', async () => {
    const authState = createAuthState();
    const loginMock = vi.fn().mockImplementation(async () => {
      authState.error = 'Invalid email or password';
      throw new Error('Invalid email or password');
    });
    authState.login = loginMock;
    mockUseAuth.mockImplementation(() => authState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalled();

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
  });
});
