import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SearchPage from '../SearchPage';
import { useProfile } from '@/hooks/useProfile';
import { feedService } from '@/services';

vi.mock('@/hooks/useProfile');
vi.mock('@/services', () => ({
  feedService: {
    getFeed: vi.fn(),
    likeProfile: vi.fn(),
    getMatches: vi.fn(),
  },
  profileService: {
    getPublicProfile: vi.fn(),
  },
  authService: {},
  settingsService: {},
}));

const mockedUseProfile = useProfile as unknown as vi.MockedFunction<typeof useProfile>;
const mockedFeedService = feedService as unknown as {
  getFeed: vi.Mock;
  likeProfile: vi.Mock;
  getMatches: vi.Mock;
};

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseProfile.mockReset();
    mockedFeedService.getFeed.mockReset();
    mockedFeedService.likeProfile.mockReset();
    mockedFeedService.getMatches.mockReset();
  });

  const createProfileState = (overrides: Partial<ReturnType<typeof useProfile>> = {}) => ({
    profile: {
      id: 1,
      user_id: 1,
      display_name: 'Current User',
      gender: 'female' as const,
      avatar_url: null,
      bio: 'Bio',
      hobbies: 'Hobbies',
      favorite_joke: 'My joke',
      is_active: true,
      created_at: '',
      updated_at: '',
    },
    loading: false,
    error: null,
    updateProfile: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  });

  it('allows liking a profile and updates the feed', async () => {
    mockedUseProfile.mockReturnValue(createProfileState());
    mockedFeedService.getFeed.mockResolvedValue({
      profiles: [
        {
          id: 10,
          user_id: 2,
          display_name: 'Alice',
          gender: 'female',
          avatar_url: null,
          favorite_joke: 'Why did the chicken cross the road?',
        },
        {
          id: 11,
          user_id: 3,
          display_name: 'Bob',
          gender: 'male',
          avatar_url: null,
          favorite_joke: 'Another joke',
        },
      ],
      total: 2,
      page: 1,
      size: 6,
      has_next: false,
      has_prev: false,
    });
    mockedFeedService.likeProfile.mockResolvedValue({
      id: 1,
      liker_id: 1,
      target_id: 2,
      mutual: false,
      created_at: '2024-01-01T00:00:00Z',
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(mockedFeedService.likeProfile).toHaveBeenCalledWith(2);
    });

    await waitFor(() => {
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/You liked Alice/i)).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows empty state when no profiles are available', async () => {
    mockedUseProfile.mockReturnValue(createProfileState());
    mockedFeedService.getFeed.mockResolvedValue({
      profiles: [],
      total: 0,
      page: 1,
      size: 6,
      has_next: false,
      has_prev: false,
    });

    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/you're all caught up/i)).toBeInTheDocument();
    });
  });
});
