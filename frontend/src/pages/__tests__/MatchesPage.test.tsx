import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MatchesPage from '../MatchesPage';
import { feedService, profileService } from '@/services';

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

const mockedFeedService = feedService as unknown as {
  getFeed: vi.Mock;
  likeProfile: vi.Mock;
  getMatches: vi.Mock;
};
const mockedProfileService = profileService as unknown as {
  getPublicProfile: vi.Mock;
};

describe('MatchesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFeedService.getMatches.mockReset();
    mockedProfileService.getPublicProfile.mockReset();
  });

  it('renders matches returned from the service', async () => {
    mockedFeedService.getMatches.mockResolvedValue({
      matches: [
        {
          id: 1,
          liker_id: 1,
          target_id: 2,
          created_at: '2024-01-02T12:00:00Z',
          matched_with: {
            id: 5,
            user_id: 2,
            display_name: 'Alice',
            avatar_url: null,
            favorite_joke: 'A very funny anecdote.',
          },
        },
      ],
      total: 1,
    });

    render(
      <MemoryRouter>
        <MatchesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getByText(/A very funny anecdote/i)).toBeInTheDocument();
  });

  it('loads profile details when viewing a match', async () => {
    mockedFeedService.getMatches.mockResolvedValue({
      matches: [
        {
          id: 2,
          liker_id: 4,
          target_id: 7,
          created_at: '2024-02-10T09:30:00Z',
          matched_with: {
            id: 8,
            user_id: 7,
            display_name: 'Charlie',
            avatar_url: null,
            favorite_joke: 'Shared joke',
          },
        },
      ],
      total: 1,
    });

    mockedProfileService.getPublicProfile.mockResolvedValue({
      id: 20,
      user_id: 7,
      display_name: 'Charlie',
      gender: 'male',
      avatar_url: null,
      bio: 'Loves hiking on weekends.',
      hobbies: 'Hiking, Photography',
      favorite_joke: 'Shared joke',
      is_active: true,
      created_at: '',
      updated_at: '',
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MatchesPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Charlie')).toBeInTheDocument());

    const viewButton = screen.getByRole('button', { name: /view profile/i });
    await user.click(viewButton);

    await waitFor(() => {
      expect(mockedProfileService.getPublicProfile).toHaveBeenCalledWith(7);
    });

    await waitFor(() => {
      expect(screen.getByText(/Loves hiking on weekends/i)).toBeInTheDocument();
    });
  });
});
