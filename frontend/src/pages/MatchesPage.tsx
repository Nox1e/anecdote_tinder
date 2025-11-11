import { useCallback, useEffect, useMemo, useState } from 'react';
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
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return timestamp;
  }
};

const getAnecdoteSnippet = (text?: string | null) => {
  if (!text) {
    return 'Анекдот пока не указан.';
  }

  if (text.length <= 160) {
    return text;
  }

  return `${text.slice(0, 157)}…`;
};

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [profileDetails, setProfileDetails] = useState<Profile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeMatch, setWriteMatch] = useState<Match | null>(null);

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

  const handleWriteClick = (match: Match) => {
    setWriteMatch(match);
    setShowWriteModal(true);
  };

  const closeWriteModal = () => {
    setShowWriteModal(false);
    setWriteMatch(null);
  };

  const hasMatches = matches.length > 0;
  const orderedMatches = useMemo(
    () => [...matches].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [matches]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ваши совпадения</h1>
          <p className="text-gray-600">
            Взаимные лайки отображаются здесь. Откройте профиль, чтобы узнать больше о собеседнике.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="btn btn-outline text-sm"
          disabled={loading}
        >
          Обновить совпадения
        </button>
      </div>

      {loading && (
        <div className="card">
          <p className="text-sm text-gray-600">Ищем новые совпадения…</p>
        </div>
      )}

      {error && (
        <div className="card border border-red-200 bg-red-50 text-red-700 space-y-3">
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-sm">Попробуйте обновить страницу, чтобы загрузить совпадения.</p>
          </div>
          <button type="button" className="btn btn-outline text-sm" onClick={handleRefresh}>
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && !hasMatches && (
        <div className="card text-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-2xl text-gray-500 font-semibold">
            :)
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Пока совпадений нет</h2>
          <p className="text-gray-600 mt-2">
            Поставьте лайк нескольким профилям в ленте. Как только кто-то ответит взаимностью, вы увидите его здесь.
          </p>
          <Link to="/search" className="btn btn-primary mt-4 inline-flex items-center justify-center">
            Вернуться в ленту
          </Link>
        </div>
      )}

      {hasMatches && (
        <div className="space-y-4">
          {orderedMatches.map(match => (
            <div key={match.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {match.matched_with.avatar_url ? (
                  <img
                    src={match.matched_with.avatar_url}
                    alt={match.matched_with.display_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-semibold text-primary-700">
                    {match.matched_with.display_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {match.matched_with.display_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Совпадение от {formatMatchedAt(match.created_at)}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                      Взаимный лайк
                    </span>
                  </div>
                  <p className="mt-4 text-gray-700">{getAnecdoteSnippet(match.matched_with.favorite_joke)}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary text-sm"
                  onClick={() => handleViewProfile(match)}
                >
                  Посмотреть профиль
                </button>
                <button
                  type="button"
                  className="btn btn-outline text-sm"
                  onClick={() => handleWriteClick(match)}
                >
                  Написать
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showWriteModal && writeMatch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={closeWriteModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Закрыть"
            >
              ×
            </button>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Скоро можно будет написать {writeMatch.matched_with.display_name}
              </h2>
              <p className="text-gray-600 text-sm">
                Мы добавим возможность общения в следующем обновлении. Скоро вы сможете отправить первое сообщение прямо из этой карточки.
              </p>
              <div className="flex justify-end">
                <button type="button" onClick={closeWriteModal} className="btn btn-primary text-sm">
                  Понятно
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {selectedMatch.matched_with.avatar_url ? (
                  <img
                    src={selectedMatch.matched_with.avatar_url}
                    alt={selectedMatch.matched_with.display_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-semibold text-primary-700">
                    {selectedMatch.matched_with.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedMatch.matched_with.display_name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Совпадение от {formatMatchedAt(selectedMatch.created_at)}
                  </p>
                </div>
              </div>

              {detailLoading && (
                <p className="text-sm text-gray-600">Загружаем детали профиля…</p>
              )}

              {detailError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {detailError}
                </div>
              )}

              {profileDetails && !detailLoading && !detailError && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Основная информация
                    </h3>
                    <p className="text-gray-700 mt-2">
                      {formatGender(profileDetails.gender) || 'Пол не указан'}
                    </p>
                  </div>
                  {profileDetails.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        О себе
                      </h3>
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{profileDetails.bio}</p>
                    </div>
                  )}
                  {profileDetails.hobbies && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Увлечения
                      </h3>
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{profileDetails.hobbies}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Любимый анекдот
                    </h3>
                    <p className="text-gray-700 mt-2 whitespace-pre-line">
                      {profileDetails.favorite_joke || 'Анекдот пока не указан.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button type="button" onClick={closeModal} className="btn btn-outline text-sm">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
