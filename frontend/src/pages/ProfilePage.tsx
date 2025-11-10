const ProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-gray-900 mb-1">
                John Doe
              </h2>
              <p className="text-gray-500 mb-4">@johndoe</p>
              <button className="btn btn-outline w-full">Change Avatar</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  className="input"
                  defaultValue="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="input"
                  defaultValue="I'm a software developer who loves hiking and photography."
                />
              </div>

              <div>
                <label
                  htmlFor="hobbies"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hobbies & Interests
                </label>
                <input
                  type="text"
                  id="hobbies"
                  className="input"
                  defaultValue="Hiking, Photography, Coding, Reading"
                />
              </div>

              <div>
                <label
                  htmlFor="favoriteJoke"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Favorite Joke
                </label>
                <textarea
                  id="favoriteJoke"
                  rows={3}
                  className="input"
                  defaultValue="Why don't scientists trust atoms? Because they make up everything!"
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button type="button" className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
