import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { settingsService } from '@/services';
import { AuthError } from '@/services/auth';

const SettingsPage = () => {
  const { profile, refetch, loading: profileLoading } = useProfile();
  const [isClosing, setIsClosing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closeSuccess, setCloseSuccess] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmReopen, setShowConfirmReopen] = useState(false);

  const handleCloseProfile = async () => {
    setIsClosing(true);
    setCloseError(null);
    setCloseSuccess(false);

    try {
      await settingsService.closeProfile();
      setCloseSuccess(true);
      await refetch();
      setShowConfirmClose(false);
      setTimeout(() => setCloseSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Не удалось закрыть профиль';
      setCloseError(message);
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenProfile = async () => {
    setIsReopening(true);
    setCloseError(null);
    setCloseSuccess(false);

    try {
      await settingsService.reopenProfile();
      setCloseSuccess(true);
      await refetch();
      setShowConfirmReopen(false);
      setTimeout(() => setCloseSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Не удалось открыть профиль';
      setCloseError(message);
    } finally {
      setIsReopening(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="container max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-tinder-orange rounded-full mx-auto mb-4" />
            <p className="text-sm text-gray-600">Загружаем настройки…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-tinder-orange bg-clip-text text-transparent mb-2">
          Настройки
        </h1>
        <p className="text-gray-600">
          Управляйте видимостью профиля и другими параметрами
        </p>
      </div>

      {closeSuccess && (
        <div className="mb-6 bg-gradient-to-r from-green-400 to-tinder-coral text-white rounded-3xl p-5 shadow-tinder-xl animate-bounce-in">
          <p className="font-bold text-center">
            {profile?.is_active ? '✅ Профиль успешно открыт!' : '🚫 Профиль успешно закрыт'}
          </p>
        </div>
      )}

      {closeError && (
        <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl p-5 shadow-tinder-xl animate-bounce-in">
          <p className="font-bold text-center">{closeError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div className="card">
          <div className="flex items-start space-x-4 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-tinder ${
              profile?.is_active 
                ? 'bg-gradient-to-br from-green-400 to-tinder-coral' 
                : 'bg-gradient-to-br from-gray-300 to-gray-400'
            }`}>
              {profile?.is_active ? '👁️' : '🙈'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Видимость профиля
              </h2>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">Статус:</span>
                {profile?.is_active ? (
                  <span className="pill bg-gradient-to-r from-green-100 to-tinder-light text-green-700">
                    ✨ Активен
                  </span>
                ) : (
                  <span className="pill bg-gray-200 text-gray-700">
                    😴 Скрыт
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {profile?.is_active
                  ? 'Ваш профиль виден другим пользователям, и вы появляетесь в их ленте. Вы можете получать лайки и создавать совпадения.'
                  : 'Ваш профиль скрыт. Вы не появляетесь в ленте других пользователей и не можете получать новые лайки. Откройте профиль, чтобы снова стать видимым.'}
              </p>
              
              {profile?.is_active ? (
                <div className="space-y-3">
                  {!showConfirmClose && (
                    <button
                      onClick={() => setShowConfirmClose(true)}
                      disabled={isClosing}
                      className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      {isClosing ? 'Закрываем...' : 'Скрыть профиль'}
                    </button>
                  )}
                  {showConfirmClose && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                      <p className="text-sm font-medium text-red-900">
                        Вы уверены? Ваш профиль будет скрыт от других пользователей, но вы сможете открыть его снова в любое время.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCloseProfile}
                          disabled={isClosing}
                          className="btn btn-primary bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400"
                        >
                          {isClosing ? 'Закрываем...' : 'Да, скрыть'}
                        </button>
                        <button
                          onClick={() => setShowConfirmClose(false)}
                          disabled={isClosing}
                          className="btn btn-outline"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {!showConfirmReopen && (
                    <button
                      onClick={() => setShowConfirmReopen(true)}
                      disabled={isReopening}
                      className="btn btn-primary bg-gradient-to-r from-green-400 to-tinder-coral hover:from-green-500 hover:to-tinder-coral"
                    >
                      {isReopening ? 'Открываем...' : 'Открыть профиль'}
                    </button>
                  )}
                  {showConfirmReopen && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
                      <p className="text-sm font-medium text-green-900">
                        Открыть профиль? Вы снова станете видимым для других пользователей и появитесь в их ленте.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleReopenProfile}
                          disabled={isReopening}
                          className="btn btn-primary"
                        >
                          {isReopening ? 'Открываем...' : 'Да, открыть'}
                        </button>
                        <button
                          onClick={() => setShowConfirmReopen(false)}
                          disabled={isReopening}
                          className="btn btn-outline"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-100">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-2xl shadow-tinder">
              ⚠️
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                Опасная зона
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Действия в этом разделе необратимы. Пожалуйста, будьте внимательны.
              </p>
              
              <div className="pt-4 border-t border-red-100">
                <h3 className="font-bold text-gray-900 mb-2">Удалить аккаунт</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Безвозвратно удалите аккаунт и все данные. Это действие нельзя отменить.
                </p>
                <button
                  className="btn btn-outline border-red-200 text-red-700 opacity-50 cursor-not-allowed"
                  disabled
                >
                  Удалить аккаунт (скоро)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-gradient-to-br from-primary-50 to-tinder-light border-primary-100">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Совет</h3>
              <p className="text-sm text-gray-700">
                Если вы хотите сделать перерыв, но не потерять свои совпадения, просто скройте профиль. 
                Все ваши матчи и данные сохранятся, и вы сможете вернуться в любое время!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
