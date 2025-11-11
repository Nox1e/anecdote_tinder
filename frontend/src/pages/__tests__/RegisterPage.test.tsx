import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterPage from '../RegisterPage';
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

describe('RegisterPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mockUseAuth.mockReset();
  });

  it('validates matching passwords before submitting', async () => {
    const authState = createAuthState();
    mockUseAuth.mockImplementation(() => authState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/электронная почта/i), 'new@example.com');
    await user.type(screen.getByLabelText(/имя пользователя/i), 'newuser');
    await user.type(screen.getByLabelText(/^пароль$/i), 'password123');
    await user.type(
      screen.getByLabelText(/подтвердите пароль/i),
      'differentPassword'
    );

    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(
      await screen.findByText(/пароли должны совпадать/i)
    ).toBeInTheDocument();
    expect(authState.register).not.toHaveBeenCalled();
  });

  it('registers a new account and navigates to search', async () => {
    const registerMock = vi.fn().mockResolvedValue({});
    const authState = createAuthState({ register: registerMock });
    mockUseAuth.mockImplementation(() => authState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/электронная почта/i), 'new@example.com');
    await user.type(screen.getByLabelText(/имя пользователя/i), 'newuser');
    await user.type(screen.getByLabelText(/^пароль$/i), 'password123');
    await user.type(screen.getByLabelText(/подтвердите пароль/i), 'password123');

    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
      });
    });

    expect(navigateMock).toHaveBeenCalledWith('/search', { replace: true });
  });

  it('renders server errors from the auth store', async () => {
    const authState = createAuthState();
    const registerMock = vi.fn().mockImplementation(async () => {
      authState.error = 'Username already taken';
      throw new Error('Username already taken');
    });
    authState.register = registerMock;
    mockUseAuth.mockImplementation(() => authState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/электронная почта/i), 'new@example.com');
    await user.type(screen.getByLabelText(/имя пользователя/i), 'newuser');
    await user.type(screen.getByLabelText(/^пароль$/i), 'password123');
    await user.type(screen.getByLabelText(/подтвердите пароль/i), 'password123');

    await user.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    expect(registerMock).toHaveBeenCalled();
    expect(
      await screen.findByText(/username already taken/i)
    ).toBeInTheDocument();
  });
});
