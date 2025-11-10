const SearchPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover People
        </h1>
        <p className="text-gray-600">
          Find and connect with interesting people
        </p>
      </div>

      <div className="card">
        <div className="mb-6">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search by name or interests
          </label>
          <input
            type="text"
            id="search"
            className="input"
            placeholder="Enter search terms..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-medium text-gray-900">User {i}</h3>
                  <p className="text-sm text-gray-500">@user{i}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <div className="flex space-x-2">
                <button className="btn btn-primary text-sm flex-1">Like</button>
                <button className="btn btn-outline text-sm flex-1">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
