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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-gray-500">Загружаем настройки…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
        <p className="text-gray-600">
          Управляйте параметрами аккаунта и предпочтениями
        </p>
      </div>

      {closeSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {profile?.is_active ? 'Профиль успешно открыт' : 'Профиль успешно закрыт'}
        </div>
      )}

      {closeError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {closeError}
        </div>
      )}

      <div className="space-y-6">
        <div className="card border-red-200">
          <h2 className="text-xl font-medium text-red-900 mb-4">Опасная зона</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Статус профиля: {profile?.is_active ? (
                  <span className="text-green-600 text-sm">Открыт</span>
                ) : (
                  <span className="text-red-600 text-sm">Закрыт</span>
                )}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {profile?.is_active
                  ? 'Ваш профиль сейчас виден другим пользователям. Вы можете закрыть его, чтобы скрыть профиль.'
                  : 'Ваш профиль сейчас скрыт от других пользователей. Вы можете открыть его, чтобы снова стать видимым.'}
              </p>
              {profile?.is_active ? (
                <>
                  <button
                    onClick={() => setShowConfirmClose(true)}
                    disabled={isClosing}
                    className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClosing ? 'Закрываем...' : 'Закрыть профиль'}
                  </button>
                  {showConfirmClose && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-900 mb-3">
                        Вы уверены, что хотите закрыть профиль? Он будет скрыт от других пользователей, но вы сможете открыть его снова в любое время.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCloseProfile}
                          disabled={isClosing}
                          className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isClosing ? 'Закрываем...' : 'Да, закрыть профиль'}
                        </button>
                        <button
                          onClick={() => setShowConfirmClose(false)}
                          disabled={isClosing}
                          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowConfirmReopen(true)}
                    disabled={isReopening}
                    className="btn btn-outline border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReopening ? 'Открываем...' : 'Открыть профиль'}
                  </button>
                  {showConfirmReopen && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-900 mb-3">
                        Вы уверены, что хотите открыть профиль? Он снова станет видимым для других пользователей.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleReopenProfile}
                          disabled={isReopening}
                          className="btn btn-outline border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReopening ? 'Открываем...' : 'Да, открыть профиль'}
                        </button>
                        <button
                          onClick={() => setShowConfirmReopen(false)}
                          disabled={isReopening}
                          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="pt-4 border-t border-red-200">
              <h3 className="font-medium text-gray-900 mb-2">Удалить аккаунт</h3>
              <p className="text-sm text-gray-500 mb-3">
                Безвозвратно удалите аккаунт и все данные. Это действие нельзя отменить.
              </p>
              <button
                className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Удалить аккаунт (скоро)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
