import { useState, useEffect } from 'react';
import { likesService } from '@/services';
import { FeedResponse, Match } from '@/types/api';

export const useLikes = () => {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const data = await likesService.getFeed(page, size);
      setFeed(data);
    } catch (err) {
      setError('Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setError(null);
      const data = await likesService.getMatches();
      setMatches(data);
    } catch (err) {
      setError('Failed to fetch matches');
    }
  };

  const likeUser = async (targetId: number) => {
    try {
      setError(null);
      await likesService.likeUser(targetId);
      // Refresh matches after liking
      await fetchMatches();
    } catch (err) {
      setError('Failed to like user');
      throw err;
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchMatches();
  }, []);

  return {
    feed,
    matches,
    loading,
    error,
    likeUser,
    refetchFeed: fetchFeed,
    refetchMatches: fetchMatches,
  };
};
