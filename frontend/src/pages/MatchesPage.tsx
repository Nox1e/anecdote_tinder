import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedService, profileService } from '@/services';
import { Match, MatchesResponse, Profile } from '@/types/api';

const formatGender = (gender?: Profile['gender']) => {
  if (!gender) {
    return null;
  }

  const genderMap: Record<NonNullable<Profile['gender']>, string> = {
    male: 'Мужчина',
    female: 'Женщина',
    other: 'Другое',
    prefer_not_to_say: 'Предпочитаю не указывать',
  };

  return genderMap[gender] ?? null;
};

const formatMatchedAt = (timestamp: string) => {
  try {
    const now = new Date();
    const matchDate = new Date(timestamp);
    const diffMs = now.getTime() - matchDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Только что';
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
      return `${diffDays} д назад`;
    } else {
      return matchDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  } catch {
    return timestamp;
  }
};

const getAnecdoteSnippet = (text?: string | null) => {
  if (!text) {
    return 'Анекдот пока не указан.';
  }

  if (text.length <= 80) {
    return text;
  }

  return `${text.slice(0, 77)}…`;
};

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [profileDetails, setProfileDetails] = useState<Profile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: MatchesResponse = await feedService.getMatches();
      setMatches(response.matches);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить совпадения';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  const handleRefresh = () => {
    void fetchMatches();
  };

  const handleViewProfile = async (match: Match) => {
    setSelectedMatch(match);
    setProfileDetails(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const profile = await profileService.getPublicProfile(match.matched_with.user_id);
      setProfileDetails(profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить детали профиля';
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setProfileDetails(null);
    setDetailError(null);
  };

  const hasMatches = matches.length > 0;

  return (
    <div className="container max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-tinder-orange bg-clip-text text-transparent mb-2">
          Matches
        </h1>
        <p className="text-gray-600">Ваши взаимные симпатии</p>
      </div>

      {loading && (
        <div className="card text-center animate-pulse">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-primary-100 to-tinder-light rounded-2xl" />
              ))}
            </div>
            <p className="text-sm text-gray-600">Загружаем ваши совпадения…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card text-center space-y-4 border-red-200">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto flex items-center justify-center text-3xl">
            😕
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">{error}</p>
            <p className="text-sm text-gray-600 mt-1">Попробуйте обновить страницу</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleRefresh}>
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && !hasMatches && (
        <div className="card text-center space-y-4 animate-slide-up">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto flex items-center justify-center text-4xl">
            💔
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Пока нет совпадений</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Начните ставить лайки людям, и когда они ответят взаимностью, здесь появятся ваши матчи
          </p>
          <Link to="/search" className="btn btn-primary inline-flex items-center justify-center mt-4">
            Искать людей
          </Link>
        </div>
      )}

      {hasMatches && (
        <div className="space-y-6">
          {/* New Matches Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span>Новые совпадения</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {matches.slice(0, 8).map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleViewProfile(match)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 via-tinder-light to-tinder-peach/20 shadow-tinder hover:shadow-tinder-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {match.matched_with.avatar_url ? (
                    <img
                      src={match.matched_with.avatar_url}
                      alt={match.matched_with.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white/80">
                      {match.matched_with.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-bold text-sm truncate">{match.matched_with.display_name}</p>
                    <p className="text-xs text-white/80">{formatMatchedAt(match.created_at)}</p>
                  </div>

                  {/* New badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-500 to-tinder-orange text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    NEW
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* All Matches List */}
          {matches.length > 8 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="text-2xl">💬</span>
                <span>Все совпадения</span>
              </h2>
              <div className="space-y-3">
                {matches.slice(8).map((match) => (
                  <button
                    key={match.id}
                    onClick={() => handleViewProfile(match)}
                    className="w-full card hover:shadow-tinder-xl transition-all duration-200 p-4"
                  >
                    <div className="flex items-center space-x-4">
                      {match.matched_with.avatar_url ? (
                        <img
                          src={match.matched_with.avatar_url}
                          alt={match.matched_with.display_name}
                          className="w-16 h-16 rounded-full object-cover shadow-tinder"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-200 to-tinder-coral flex items-center justify-center text-2xl font-bold text-white shadow-tinder">
                          {match.matched_with.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1 text-left min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {match.matched_with.display_name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {getAnecdoteSnippet(match.matched_with.favorite_joke)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatMatchedAt(match.created_at)}
                        </p>
                      </div>

                      <div className="text-primary-500">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8 z-50 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-tinder-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 p-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-bold text-gray-900">Профиль</h2>
              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Закрыть"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                {selectedMatch.matched_with.avatar_url ? (
                  <img
                    src={selectedMatch.matched_with.avatar_url}
                    alt={selectedMatch.matched_with.display_name}
                    className="w-32 h-32 rounded-full object-cover mx-auto shadow-tinder-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-300 to-tinder-orange flex items-center justify-center text-5xl font-bold text-white mx-auto shadow-tinder-lg">
                    {selectedMatch.matched_with.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-3xl font-bold text-gray-900 mt-4">
                  {selectedMatch.matched_with.display_name}
                </h2>
                <div className="mt-2 inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-100 to-tinder-light text-primary-600 text-sm font-semibold">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Взаимный матч {formatMatchedAt(selectedMatch.created_at)}
                </div>
              </div>

              {detailLoading && (
                <div className="text-center py-8">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4">Загружаем детали профиля…</p>
                </div>
              )}

              {detailError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {detailError}
                </div>
              )}

              {profileDetails && !detailLoading && !detailError && (
                <div className="space-y-4">
                  {formatGender(profileDetails.gender) && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Пол
                      </h3>
                      <p className="text-gray-900 font-medium">{formatGender(profileDetails.gender)}</p>
                    </div>
                  )}
                  
                  {profileDetails.bio && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        О себе
                      </h3>
                      <p className="text-gray-900 whitespace-pre-line">{profileDetails.bio}</p>
                    </div>
                  )}
                  
                  {profileDetails.hobbies && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Увлечения
                      </h3>
                      <p className="text-gray-900 whitespace-pre-line">{profileDetails.hobbies}</p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-primary-50 to-tinder-light rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
                      <span>😂</span>
                      <span>Любимый анекдот</span>
                    </h3>
                    <p className="text-gray-900 whitespace-pre-line">
                      {profileDetails.favorite_joke || 'Анекдот пока не указан.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  className="w-full btn btn-primary py-3 text-base"
                  onClick={() => {
                    closeModal();
                  }}
                >
                  Написать сообщение
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Функция отправки сообщений скоро появится
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
