import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProfilePage from '../ProfilePage';
import { useProfile } from '@/hooks/useProfile';

vi.mock('@/hooks/useProfile');

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
  updateProfile: vi.fn().mockResolvedValue({}),
  refetch: vi.fn(),
  ...overrides,
});

describe('ProfilePage', () => {
  beforeEach(() => {
    mockUseProfile.mockReset();
  });

  it('displays loading state when profile is loading', () => {
    mockUseProfile.mockImplementation(() => createProfileState({ loading: true }));

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
  });

  it('displays error message when profile fails to load', () => {
    const errorMessage = 'Failed to fetch profile';
    mockUseProfile.mockImplementation(() =>
      createProfileState({ error: errorMessage, profile: null })
    );

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays profile data in form fields', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('I am a developer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hiking, Coding')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Why did the programmer quit his job?')
    ).toBeInTheDocument();
  });

  it('displays avatar image when avatar_url is provided', () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const avatarImg = screen.getByAltText('John Doe') as HTMLImageElement;
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg.src).toBe('https://example.com/avatar.jpg');
  });

  it('submits form with updated profile data', async () => {
    const updateMock = vi.fn().mockResolvedValue({});
    const profileState = createProfileState({ updateProfile: updateMock });
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const bioInput = screen.getByDisplayValue('I am a developer');
    await user.clear(bioInput);
    await user.type(bioInput, 'I am a senior developer');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          bio: 'I am a senior developer',
        })
      );
    });
  });

  it('displays success message after profile update', async () => {
    const updateMock = vi.fn().mockResolvedValue({});
    const profileState = createProfileState({ updateProfile: updateMock });
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(/profile updated successfully/i)
    ).toBeInTheDocument();
  });

  it('displays validation error for missing display name', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const displayNameInput = screen.getByDisplayValue('John Doe');
    await user.clear(displayNameInput);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/display name is required/i)
    ).toBeInTheDocument();
  });

  it('displays validation error for display name exceeding max length', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const displayNameInput = screen.getByDisplayValue('John Doe');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'a'.repeat(256));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/display name must be 255 characters or less/i)
    ).toBeInTheDocument();
  });

  it('displays validation error for bio exceeding max length', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const bioInput = screen.getByDisplayValue('I am a developer');
    await user.clear(bioInput);
    await user.type(bioInput, 'a'.repeat(1001));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/bio must be 1000 characters or less/i)
    ).toBeInTheDocument();
  });

  it('displays validation error for hobbies exceeding max length', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const hobbiesInput = screen.getByDisplayValue('Hiking, Coding');
    await user.clear(hobbiesInput);
    await user.type(hobbiesInput, 'a'.repeat(1001));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/hobbies must be 1000 characters or less/i)
    ).toBeInTheDocument();
  });

  it('displays validation error for favorite joke exceeding max length', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const jokeInput = screen.getByDisplayValue('Why did the programmer quit his job?');
    await user.clear(jokeInput);
    await user.type(jokeInput, 'a'.repeat(501));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/favorite joke must be 500 characters or less/i)
    ).toBeInTheDocument();
  });

  it('displays validation error for avatar URL exceeding max length', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const avatarInput = screen.getByDisplayValue('https://example.com/avatar.jpg');
    await user.clear(avatarInput);
    await user.type(avatarInput, 'https://example.com/' + 'a'.repeat(481));

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/avatar url must be 500 characters or less/i)
    ).toBeInTheDocument();
  });

  it('cancels form and resets fields to original values', async () => {
    const profileState = createProfileState();
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const bioInput = screen.getByDisplayValue('I am a developer');
    await user.clear(bioInput);
    await user.type(bioInput, 'Updated bio');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.getByDisplayValue('I am a developer')).toBeInTheDocument();
  });

  it('updates gender field', async () => {
    const updateMock = vi.fn().mockResolvedValue({});
    const profileState = createProfileState({ updateProfile: updateMock });
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const genderSelect = screen.getByDisplayValue('male') as HTMLSelectElement;
    await user.selectOptions(genderSelect, 'female');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'female',
        })
      );
    });
  });

  it('displays error message when update fails', async () => {
    const errorMessage = 'Server error';
    const updateMock = vi
      .fn()
      .mockRejectedValue(new Error(errorMessage));
    const profileState = createProfileState({ updateProfile: updateMock });
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(/failed to update profile/i)
    ).toBeInTheDocument();
  });

  it('disables form while submitting', async () => {
    let resolveUpdate: () => void;
    const updatePromise = new Promise<void>(resolve => {
      resolveUpdate = resolve;
    });
    const updateMock = vi.fn().mockReturnValue(updatePromise);
    const profileState = createProfileState({ updateProfile: updateMock });
    mockUseProfile.mockImplementation(() => profileState);

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

    resolveUpdate!();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled();
    });
  });
});
