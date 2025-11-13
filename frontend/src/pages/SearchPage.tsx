import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedService } from '@/services';
import { FeedProfile, FeedResponse } from '@/types/api';
import { useProfile } from '@/hooks/useProfile';

const PAGE_SIZE = 6;

const formatGender = (gender?: FeedProfile['gender']) => {
  if (!gender) {
    return null;
  }

  const genderMap: Record<NonNullable<FeedProfile['gender']>, string> = {
    male: 'Мужчина',
    female: 'Женщина',
    other: 'Другое',
    prefer_not_to_say: 'Предпочитаю не указывать',
  };

  return genderMap[gender] ?? null;
};

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const LightningIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

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
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);

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
        const message = err instanceof Error ? err.message : 'Не удалось загрузить ленту';
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
  }, [profile, profileLoading, loadFeed]);

  const currentProfile = feed[0];

  const handleLike = async () => {
    if (!currentProfile || likingId === currentProfile.user_id || animating) {
      return;
    }

    setActionError(null);
    setSuccessMessage(null);
    setLikingId(currentProfile.user_id);
    setAnimating('right');

    setTimeout(async () => {
      try {
        const response = await feedService.likeProfile(currentProfile.user_id);
        const remaining = feed.filter(profile => profile.user_id !== currentProfile.user_id);
        setFeed(remaining);

        if (remaining.length === 0 && hasNext) {
          await loadFeed(page + 1, { append: true });
        }

        if (response.mutual) {
          setSuccessMessage(`🎉 Взаимная симпатия с ${currentProfile.display_name}!`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось отправить лайк';
        setActionError(message);
      } finally {
        setLikingId(null);
        setAnimating(null);
      }
    }, 300);
  };

  const handleSkip = async () => {
    if (!currentProfile || animating) {
      return;
    }

    setSuccessMessage(null);
    setActionError(null);
    setAnimating('left');

    setTimeout(async () => {
      try {
        await feedService.skipProfile(currentProfile.user_id);
        const remaining = feed.slice(1);
        setFeed(remaining);

        if (remaining.length === 0 && hasNext) {
          await loadFeed(page + 1, { append: true });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось пропустить профиль';
        setActionError(message);
      } finally {
        setAnimating(null);
      }
    }, 300);
  };

  const handleRetry = () => {
    setSuccessMessage(null);
    setActionError(null);
    void loadFeed(1);
  };

  const handleRefreshProfile = () => {
    setSuccessMessage(null);
    setActionError(null);
    void refetchProfile();
  };

  const isFeedUnavailable = !loading && !loadingMore && feed.length === 0 && !error;
  const profileIsInactive = profile && !profile.is_active;

  return (
    <div className="container max-w-xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 bg-white/70 backdrop-blur rounded-3xl shadow-tinder-lg p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Swipe & Laugh</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Лента совпадений</h1>
          <p className="text-sm text-gray-600 mt-2">
            Свайпайте карточки с анекдотами и ищите тех, кто разделит ваше чувство юмора.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="btn btn-outline flex-1"
            disabled={loading}
          >
            Обновить ленту
          </button>
          <button
            type="button"
            onClick={handleRefreshProfile}
            className="btn btn-outline flex-1"
            disabled={profileLoading}
          >
            Обновить профиль
          </button>
        </div>
      </div>

      {profileLoading && (
        <div className="card text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-tinder-orange rounded-full mx-auto mb-4" />
            <p className="text-sm text-gray-600">Загружаем ваш профиль…</p>
          </div>
        </div>
      )}

      {profileError && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl p-6 shadow-tinder-xl animate-bounce-in">
          <p className="font-bold text-lg">Ошибка загрузки профиля</p>
          <p className="text-sm mt-1 text-white/90">{profileError}</p>
        </div>
      )}

      {profileIsInactive && (
        <div className="card text-center space-y-4 animate-slide-up">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center text-3xl">
            😴
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Профиль скрыт</h2>
          <p className="text-gray-600">
            Откройте профиль в настройках, чтобы появиться в ленте других пользователей
          </p>
          <Link to="/settings" className="btn btn-primary inline-flex items-center justify-center mt-4">
            Перейти в настройки
          </Link>
        </div>
      )}

      {successMessage && (
        <div className="bg-gradient-to-r from-green-400 to-tinder-coral text-white rounded-3xl p-5 shadow-tinder-xl mb-4 animate-bounce-in">
          <p className="font-bold text-center">{successMessage}</p>
          <p className="text-sm text-center mt-1 text-white/90">
            Посмотрите <Link to="/matches" className="underline font-bold">страницу совпадений</Link>
          </p>
        </div>
      )}

      {actionError && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl p-5 shadow-tinder-xl mb-4 animate-bounce-in">
          <p className="font-bold text-center">{actionError}</p>
        </div>
      )}

      {!profileIsInactive && (
        <div className="space-y-6">
          {loading && feed.length === 0 && !error && (
            <div className="card text-center">
              <div className="animate-pulse space-y-4">
                <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-tinder-light rounded-2xl" />
                <div className="flex justify-center space-x-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                  <div className="w-16 h-16 bg-gray-300 rounded-full" />
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Подбираем людей для вас…</p>
            </div>
          )}

          {error && (
            <div className="card text-center space-y-4 border-red-200">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto flex items-center justify-center text-3xl">
                😕
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{error}</p>
                <p className="text-sm text-gray-600 mt-1">Пожалуйста, попробуйте позже</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleRetry}>
                Попробовать снова
              </button>
            </div>
          )}

          {isFeedUnavailable && (
            <div className="card text-center space-y-4 animate-slide-up">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-tinder-light rounded-full mx-auto flex items-center justify-center text-3xl">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Вы просмотрели всех!</h2>
              <p className="text-gray-600">
                Загляните позже за новыми знакомствами
              </p>
              <button type="button" className="btn btn-primary mt-4" onClick={handleRetry}>
                Обновить ленту
              </button>
            </div>
          )}

          {currentProfile && (
            <div className="space-y-6">
              {/* Main Card */}
              <div className={`relative ${animating === 'left' ? 'animate-swipe-left' : animating === 'right' ? 'animate-swipe-right' : ''}`}>
                <div className="relative bg-white rounded-3xl shadow-tinder-xl overflow-hidden border border-gray-100">
                  {/* Avatar/Photo Section */}
                  <div className="relative h-[500px] bg-gradient-to-br from-primary-100 via-tinder-light to-tinder-peach/20">
                    {currentProfile.avatar_url ? (
                      <img
                        src={currentProfile.avatar_url}
                        alt={currentProfile.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-9xl font-bold text-white/80">
                          {currentProfile.display_name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-end justify-between">
                        <div>
                          <h2 className="text-3xl font-bold mb-1">
                            {currentProfile.display_name}
                          </h2>
                          {formatGender(currentProfile.gender) && (
                            <p className="text-white/90 text-sm">
                              {formatGender(currentProfile.gender)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">😂</span>
                        <h3 className="font-bold text-gray-900">Любимый анекдот</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {currentProfile.favorite_joke || 'Анекдот пока не указан.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Swipe indicators */}
                {animating === 'right' && (
                  <div className="absolute top-12 right-12 bg-green-500 text-white px-8 py-4 rounded-2xl transform rotate-12 text-2xl font-bold shadow-tinder-xl">
                    LIKE
                  </div>
                )}
                {animating === 'left' && (
                  <div className="absolute top-12 left-12 bg-red-500 text-white px-8 py-4 rounded-2xl transform -rotate-12 text-2xl font-bold shadow-tinder-xl">
                    NOPE
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center space-x-4 py-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={animating !== null}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-red-500 shadow-tinder-lg hover:shadow-tinder-xl transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-red-100"
                  aria-label="Пропустить"
                >
                  <XIcon />
                </button>

                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-blue-500 shadow-tinder hover:shadow-tinder-lg transition-all duration-200 hover:scale-105 active:scale-95 opacity-50 cursor-not-allowed"
                  aria-label="Супер лайк"
                  disabled
                >
                  <StarIcon />
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  disabled={likingId === currentProfile.user_id || animating !== null}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-tinder-orange text-white shadow-tinder-lg hover:shadow-tinder-xl transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Лайк"
                >
                  <HeartIcon />
                </button>

                <button
                  type="button"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-purple-500 shadow-tinder hover:shadow-tinder-lg transition-all duration-200 hover:scale-105 active:scale-95 opacity-50 cursor-not-allowed"
                  aria-label="Boost"
                  disabled
                >
                  <LightningIcon />
                </button>
              </div>

              {/* Additional cards preview (stack effect) */}
              {feed.length > 1 && (
                <div className="relative -mt-[520px] pointer-events-none">
                  <div className="absolute inset-x-4 top-2 h-[500px] bg-white rounded-3xl shadow-tinder opacity-50 transform scale-95" />
                  {feed.length > 2 && (
                    <div className="absolute inset-x-8 top-4 h-[500px] bg-white rounded-3xl shadow-sm opacity-30 transform scale-90" />
                  )}
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
