import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedService } from '@/services';
import { FeedProfile, FeedResponse } from '@/types/api';
import { useProfile } from '@/hooks/useProfile';

const PAGE_SIZE = 6;

const formatGender = (gender?: FeedProfile['gender']) => {
  if (!gender) {
    return null;
  }

  return gender
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const SearchPage = () => {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfile();

  const [feed, setFeed] = useState<FeedProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<number | null>(null);

  const loadFeed = useCallback(
    async (requestedPage: number, { append = false } = {}) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response: FeedResponse = await feedService.getFeed(requestedPage, PAGE_SIZE);
        setPage(response.page);
        setHasNext(response.has_next);
        setFeed(prev => (append ? [...prev, ...response.profiles] : response.profiles));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load feed';
        setError(message);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (profileLoading) {
      return;
    }

    if (profile && !profile.is_active) {
      setFeed([]);
      setLoading(false);
      return;
    }

    void loadFeed(1);
  }, [profile?.is_active, profileLoading, loadFeed]);

  const currentProfile = feed[0];
  const upcomingProfiles = useMemo(() => feed.slice(1, 4), [feed]);

  const handleLike = async () => {
    if (!currentProfile || likingId === currentProfile.user_id) {
      return;
    }

    setActionError(null);
    setSuccessMessage(null);
    setLikingId(currentProfile.user_id);

    try {
      const response = await feedService.likeProfile(currentProfile.user_id);
      const remaining = feed.filter(profile => profile.user_id !== currentProfile.user_id);
      setFeed(remaining);

      if (remaining.length === 0 && hasNext) {
        await loadFeed(page + 1, { append: true });
      }

      if (response.mutual) {
        setSuccessMessage(`It's a match with ${currentProfile.display_name}!`);
      } else {
        setSuccessMessage(`You liked ${currentProfile.display_name}.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send like';
      setActionError(message);
    } finally {
      setLikingId(null);
    }
  };

  const handleSkip = () => {
    if (!currentProfile) {
      return;
    }

    setSuccessMessage(null);
    setActionError(null);

    const remaining = feed.slice(1);
    setFeed(remaining);

    if (remaining.length === 0 && hasNext) {
      void loadFeed(page + 1, { append: true });
    }
  };

  const handleRetry = () => {
    setSuccessMessage(null);
    setActionError(null);
    void loadFeed(1);
  };

  const handleLoadMore = () => {
    if (!hasNext || loadingMore) {
      return;
    }

    void loadFeed(page + 1, { append: true });
  };

  const isFeedUnavailable = !loading && !loadingMore && feed.length === 0 && !error;
  const profileIsInactive = profile && !profile.is_active;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover the Feed</h1>
          <p className="text-gray-600">
            Explore jokes from other users and let them know you&apos;re interested.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSuccessMessage(null);
              setActionError(null);
              void loadFeed(1);
            }}
            className="btn btn-outline text-sm"
            disabled={loading}
          >
            Refresh feed
          </button>
          <button
            type="button"
            onClick={() => {
              void refetchProfile();
            }}
            className="btn btn-outline text-sm"
            disabled={profileLoading}
          >
            Reload profile
          </button>
        </div>
      </div>

      {profileLoading && (
        <div className="card">
          <p className="text-sm text-gray-600">Loading your profile…</p>
        </div>
      )}

      {profileError && (
        <div className="card border border-red-200 bg-red-50 text-red-700">
          <p className="font-medium">{profileError}</p>
          <p className="text-sm mt-1">
            We couldn&apos;t load your profile information. Try refreshing the page.
          </p>
        </div>
      )}

      {profileIsInactive && (
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900">Your profile is hidden</h2>
          <p className="text-gray-600 mt-2">
            Reopen your profile from settings to appear in the feed and like other users.
          </p>
          <Link to="/settings" className="btn btn-primary mt-4 inline-flex items-center justify-center">
            Go to settings
          </Link>
        </div>
      )}

      {successMessage && (
        <div className="card border border-green-200 bg-green-50 text-green-700">
          <p className="font-medium">{successMessage}</p>
          <p className="text-sm mt-1">
            Check the <Link to="/matches" className="font-semibold underline">matches page</Link> to start a conversation.
          </p>
        </div>
      )}

      {actionError && (
        <div className="card border border-red-200 bg-red-50 text-red-700">
          <p className="font-medium">{actionError}</p>
        </div>
      )}

      {!profileIsInactive && (
        <div className="space-y-6">
          {loading && feed.length === 0 && !error && (
            <div className="card">
              <p className="text-sm text-gray-600">Finding people you&apos;ll love…</p>
            </div>
          )}

          {error && (
            <div className="card border border-red-200 bg-red-50 text-red-700 space-y-3">
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm">Please try again in a moment.</p>
              </div>
              <button type="button" className="btn btn-outline text-sm" onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}

          {isFeedUnavailable && (
            <div className="card text-center">
              <h2 className="text-xl font-semibold text-gray-900">You&apos;re all caught up</h2>
              <p className="text-gray-600 mt-2">
                Check back later for more people or refresh your feed now.
              </p>
              <button type="button" className="btn btn-primary mt-4" onClick={handleRetry}>
                Reload feed
              </button>
            </div>
          )}

          {currentProfile && (
            <div className="space-y-6">
              <div className="card space-y-6">
                <div className="flex items-start gap-4">
                  {currentProfile.avatar_url ? (
                    <img
                      src={currentProfile.avatar_url}
                      alt={currentProfile.display_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-semibold text-primary-700">
                      {currentProfile.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {currentProfile.display_name}
                        </h2>
                        {formatGender(currentProfile.gender) && (
                          <p className="text-sm text-gray-500">
                            {formatGender(currentProfile.gender)}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                        Joke #{currentProfile.id}
                      </span>
                    </div>
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Favorite anecdote
                      </h3>
                      <p className="mt-2 text-gray-700 whitespace-pre-line">
                        {currentProfile.favorite_joke || 'No anecdote shared yet.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="btn btn-outline"
                    disabled={likingId === currentProfile.user_id || loading}
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleLike}
                    className="btn btn-primary"
                    disabled={likingId === currentProfile.user_id}
                  >
                    {likingId === currentProfile.user_id ? 'Liking…' : 'Like'}
                  </button>
                </div>
              </div>

              {upcomingProfiles.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                    Up next
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {upcomingProfiles.map(profile => (
                      <div
                        key={profile.user_id}
                        className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.display_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                              {profile.display_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {profile.display_name}
                            </p>
                            {formatGender(profile.gender) && (
                              <p className="text-xs text-gray-500">
                                {formatGender(profile.gender)}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-600">
                          {profile.favorite_joke || 'No anecdote shared yet.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasNext && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="btn btn-outline"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading more…' : 'Load more profiles'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
