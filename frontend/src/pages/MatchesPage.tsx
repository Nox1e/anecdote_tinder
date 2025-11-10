const MatchesPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
        <p className="text-gray-600">People you've matched with</p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Match {i}</h3>
                <p className="text-gray-600 mb-2">
                  You both liked each other! Start a conversation to get to know
                  them better.
                </p>
                <div className="flex space-x-2">
                  <button className="btn btn-primary text-sm">Message</button>
                  <button className="btn btn-outline text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {false && (
        <div className="card text-center py-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No matches yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start liking people to find your matches!
          </p>
          <button className="btn btn-primary">Start Searching</button>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
