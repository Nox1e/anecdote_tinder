const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Account Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="input"
                defaultValue="john.doe@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="input"
                defaultValue="johndoe"
              />
            </div>
            <button className="btn btn-primary">Update Account</button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Privacy Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Profile Visibility
                </h3>
                <p className="text-sm text-gray-500">
                  Control who can see your profile
                </p>
              </div>
              <select className="input max-w-xs">
                <option>Everyone</option>
                <option>Matches Only</option>
                <option>Nobody</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Show Online Status
                </h3>
                <p className="text-sm text-gray-500">
                  Let others see when you're online
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  Receive email updates about your activity
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Push Notifications
                </h3>
                <p className="text-sm text-gray-500">
                  Receive push notifications on your device
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="card border-red-200">
          <h2 className="text-xl font-medium text-red-900 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Close Profile</h3>
              <p className="text-sm text-gray-500 mb-3">
                Temporarily hide your profile from other users. You can reopen
                it at any time.
              </p>
              <button className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50">
                Close Profile
              </button>
            </div>
            <div className="pt-4 border-t border-red-200">
              <h3 className="font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-3">
                Permanently delete your account and all data. This action cannot
                be undone.
              </p>
              <button className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
