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
      const message = err instanceof AuthError ? err.message : 'Failed to close profile';
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
      const message = err instanceof AuthError ? err.message : 'Failed to reopen profile';
      setCloseError(message);
    } finally {
      setIsReopening(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-gray-500">Loading your settings…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {closeSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {profile?.is_active ? 'Profile reopened successfully' : 'Profile closed successfully'}
        </div>
      )}

      {closeError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {closeError}
        </div>
      )}

      <div className="space-y-6">
        <div className="card border-red-200">
          <h2 className="text-xl font-medium text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Profile Status: {profile?.is_active ? (
                  <span className="text-green-600 text-sm">Active</span>
                ) : (
                  <span className="text-red-600 text-sm">Closed</span>
                )}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {profile?.is_active
                  ? 'Your profile is currently visible to other users. You can close it to hide your profile.'
                  : 'Your profile is currently hidden from other users. You can reopen it to become visible again.'}
              </p>
              {profile?.is_active ? (
                <>
                  <button
                    onClick={() => setShowConfirmClose(true)}
                    disabled={isClosing}
                    className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClosing ? 'Closing...' : 'Close Profile'}
                  </button>
                  {showConfirmClose && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-900 mb-3">
                        Are you sure you want to close your profile? It will be hidden from other users, but you can reopen it at any time.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCloseProfile}
                          disabled={isClosing}
                          className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isClosing ? 'Closing...' : 'Yes, Close Profile'}
                        </button>
                        <button
                          onClick={() => setShowConfirmClose(false)}
                          disabled={isClosing}
                          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
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
                    {isReopening ? 'Reopening...' : 'Reopen Profile'}
                  </button>
                  {showConfirmReopen && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-900 mb-3">
                        Are you sure you want to reopen your profile? It will be visible to other users again.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleReopenProfile}
                          disabled={isReopening}
                          className="btn btn-outline border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReopening ? 'Reopening...' : 'Yes, Reopen Profile'}
                        </button>
                        <button
                          onClick={() => setShowConfirmReopen(false)}
                          disabled={isReopening}
                          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="pt-4 border-t border-red-200">
              <h3 className="font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-3">
                Permanently delete your account and all data. This action cannot
                be undone.
              </p>
              <button
                className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Delete Account (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
