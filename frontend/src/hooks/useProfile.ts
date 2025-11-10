import { useState, useEffect } from 'react';
import { profileService } from '@/services';
import { Profile, ProfileUpdateRequest } from '@/types/api';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdateRequest) => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateMyProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
};
