import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SettingsPage from '../SettingsPage';
import { useProfile } from '@/hooks/useProfile';
import * as services from '@/services';

vi.mock('@/hooks/useProfile');
vi.mock('@/services', async () => {
  const actual = await vi.importActual('@/services');
  return {
    ...actual,
    settingsService: {
      closeProfile: vi.fn(),
      reopenProfile: vi.fn(),
    },
  };
});

const mockUseProfile = useProfile as unknown as vi.MockedFunction<typeof useProfile>;

const createProfileState = (overrides: Partial<ReturnType<typeof useProfile>> = {}) => ({
  profile: {
    id: 1,
    user_id: 1,
    display_name: 'John Doe',
    gender: 'male' as const,
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'I am a developer',
    hobbies: 'Hiking, Coding',
    favorite_joke: 'Why did the programmer quit his job?',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  loading: false,
  error: null,
  updateProfile: vi.fn(),
  refetch: vi.fn(),
  ...overrides,
});

describe('SettingsPage', () => {
  beforeEach(() => {
    mockUseProfile.mockReset();
    vi.clearAllMocks();
  });

  it('displays loading state when profile is loading', () => {
    mockUseProfile.mockImplementation(() => createProfileState({ loading: true }));

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading your settings/i)).toBeInTheDocument();
  });

  it('displays active profile status when profile is active', () => {
    mockUseProfile.mockImplementation(() => createProfileState());

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Active/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close profile/i })).toBeInTheDocument();
  });

  it('displays closed profile status when profile is inactive', () => {
    mockUseProfile.mockImplementation(() =>
      createProfileState({
        profile: {
          id: 1,
          user_id: 1,
          display_name: 'John Doe',
          gender: 'male',
          avatar_url: 'https://example.com/avatar.jpg',
          bio: 'I am a developer',
          hobbies: 'Hiking, Coding',
          favorite_joke: 'Why did the programmer quit his job?',
          is_active: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      })
    );

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Closed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reopen profile/i })).toBeInTheDocument();
  });

  it('shows confirmation dialog when close profile button is clicked', async () => {
    mockUseProfile.mockImplementation(() => createProfileState());

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    expect(
      screen.getByText(/are you sure you want to close your profile/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, close profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
  });

  it('closes profile when confirmation is accepted', async () => {
    const closeProfileMock = vi.fn().mockResolvedValue({ message: 'Profile closed' });
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    mockUseProfile.mockImplementation(() =>
      createProfileState({ refetch: refetchMock })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.closeProfile as any) = closeProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    const confirmButton = screen.getByRole('button', { name: /yes, close profile/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(closeProfileMock).toHaveBeenCalled();
    });
  });

  it('calls refetch after closing profile', async () => {
    const closeProfileMock = vi.fn().mockResolvedValue({ message: 'Profile closed' });
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    mockUseProfile.mockImplementation(() =>
      createProfileState({ refetch: refetchMock })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.closeProfile as any) = closeProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    const confirmButton = screen.getByRole('button', { name: /yes, close profile/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it('closes confirmation dialog when cancel is clicked', async () => {
    mockUseProfile.mockImplementation(() => createProfileState());

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    const cancelButton = screen.getAllByRole('button', { name: /^cancel$/i })[0];
    await user.click(cancelButton);

    expect(
      screen.queryByText(/are you sure you want to close your profile/i)
    ).not.toBeInTheDocument();
  });

  it('shows confirmation dialog when reopen profile button is clicked', async () => {
    mockUseProfile.mockImplementation(() =>
      createProfileState({
        profile: {
          id: 1,
          user_id: 1,
          display_name: 'John Doe',
          gender: 'male',
          avatar_url: 'https://example.com/avatar.jpg',
          bio: 'I am a developer',
          hobbies: 'Hiking, Coding',
          favorite_joke: 'Why did the programmer quit his job?',
          is_active: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      })
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const reopenButton = screen.getByRole('button', { name: /reopen profile/i });
    await user.click(reopenButton);

    expect(
      screen.getByText(/are you sure you want to reopen your profile/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /yes, reopen profile/i })
    ).toBeInTheDocument();
  });

  it('reopens profile when confirmation is accepted', async () => {
    const reopenProfileMock = vi.fn().mockResolvedValue({ message: 'Profile reopened' });
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    mockUseProfile.mockImplementation(() =>
      createProfileState({
        profile: {
          id: 1,
          user_id: 1,
          display_name: 'John Doe',
          gender: 'male',
          avatar_url: 'https://example.com/avatar.jpg',
          bio: 'I am a developer',
          hobbies: 'Hiking, Coding',
          favorite_joke: 'Why did the programmer quit his job?',
          is_active: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        refetch: refetchMock,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.reopenProfile as any) = reopenProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const reopenButton = screen.getByRole('button', { name: /reopen profile/i });
    await user.click(reopenButton);

    const confirmButton = screen.getByRole('button', { name: /yes, reopen profile/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(reopenProfileMock).toHaveBeenCalled();
    });
  });

  it('displays success message after closing profile', async () => {
    const closeProfileMock = vi.fn().mockResolvedValue({ message: 'Profile closed' });
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    mockUseProfile.mockImplementation(() =>
      createProfileState({ refetch: refetchMock })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.closeProfile as any) = closeProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    const confirmButton = screen.getByRole('button', { name: /yes, close profile/i });
    await user.click(confirmButton);

    expect(
      await screen.findByText(/profile closed successfully/i)
    ).toBeInTheDocument();
  });

  it('displays success message after reopening profile', async () => {
    const reopenProfileMock = vi.fn().mockResolvedValue({ message: 'Profile reopened' });
    const refetchMock = vi.fn().mockResolvedValue(undefined);
    mockUseProfile.mockImplementation(() =>
      createProfileState({
        profile: {
          id: 1,
          user_id: 1,
          display_name: 'John Doe',
          gender: 'male',
          avatar_url: 'https://example.com/avatar.jpg',
          bio: 'I am a developer',
          hobbies: 'Hiking, Coding',
          favorite_joke: 'Why did the programmer quit his job?',
          is_active: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        refetch: refetchMock,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.reopenProfile as any) = reopenProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const reopenButton = screen.getByRole('button', { name: /reopen profile/i });
    await user.click(reopenButton);

    const confirmButton = screen.getByRole('button', { name: /yes, reopen profile/i });
    await user.click(confirmButton);

    expect(
      await screen.findByText(/profile reopened successfully/i)
    ).toBeInTheDocument();
  });

  it('displays error message when closing profile fails', async () => {
    const closeProfileMock = vi
      .fn()
      .mockRejectedValue(new Error('Server error'));
    mockUseProfile.mockImplementation(() => createProfileState());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.closeProfile as any) = closeProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    const confirmButton = screen.getByRole('button', { name: /yes, close profile/i });
    await user.click(confirmButton);

    expect(
      await screen.findByText(/failed to close profile/i)
    ).toBeInTheDocument();
  });

  it('displays error message when reopening profile fails', async () => {
    const reopenProfileMock = vi
      .fn()
      .mockRejectedValue(new Error('Server error'));
    mockUseProfile.mockImplementation(() =>
      createProfileState({
        profile: {
          id: 1,
          user_id: 1,
          display_name: 'John Doe',
          gender: 'male',
          avatar_url: 'https://example.com/avatar.jpg',
          bio: 'I am a developer',
          hobbies: 'Hiking, Coding',
          favorite_joke: 'Why did the programmer quit his job?',
          is_active: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.reopenProfile as any) = reopenProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const reopenButton = screen.getByRole('button', { name: /reopen profile/i });
    await user.click(reopenButton);

    const confirmButton = screen.getByRole('button', { name: /yes, reopen profile/i });
    await user.click(confirmButton);

    expect(
      await screen.findByText(/failed to reopen profile/i)
    ).toBeInTheDocument();
  });

  it('disables buttons while closing profile', async () => {
    let resolveClose: () => void;
    const closePromise = new Promise<void>(resolve => {
      resolveClose = resolve;
    });
    const closeProfileMock = vi.fn().mockReturnValue(closePromise);
    const refetchMock = vi.fn();
    mockUseProfile.mockImplementation(() =>
      createProfileState({ refetch: refetchMock })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (services.settingsService.closeProfile as any) = closeProfileMock;

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const closeButton = screen.getByRole('button', { name: /^close profile$/i });
    await user.click(closeButton);

    const confirmButton = screen.getByRole('button', { name: /yes, close profile/i });
    await user.click(confirmButton);

    const closingButtons = screen.getAllByRole('button', { name: /closing/i });
    expect(closingButtons.length).toBeGreaterThan(0);
    closingButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });

    resolveClose!();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /yes, close profile/i })
      ).not.toBeDisabled();
    });
  });
});
