import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { ProfileUpdateRequest } from '@/types/api';
import { AuthError } from '@/services/auth';

const ProfilePage = () => {
  const { profile, loading, error, updateProfile } = useProfile();
  const [formData, setFormData] = useState<ProfileUpdateRequest>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        gender: profile.gender,
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        hobbies: profile.hobbies || '',
        favorite_joke: profile.favorite_joke || '',
      });
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.display_name?.trim()) {
      errors.display_name = 'Display name is required';
    } else if (formData.display_name.length > 255) {
      errors.display_name = 'Display name must be 255 characters or less';
    }

    if (formData.avatar_url && formData.avatar_url.length > 500) {
      errors.avatar_url = 'Avatar URL must be 500 characters or less';
    }

    if (formData.bio && formData.bio.length > 1000) {
      errors.bio = 'Bio must be 1000 characters or less';
    }

    if (formData.hobbies && formData.hobbies.length > 1000) {
      errors.hobbies = 'Hobbies must be 1000 characters or less';
    }

    if (formData.favorite_joke && formData.favorite_joke.length > 500) {
      errors.favorite_joke = 'Favorite joke must be 500 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Failed to update profile';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        gender: profile.gender,
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        hobbies: profile.hobbies || '',
        favorite_joke: profile.favorite_joke || '',
      });
      setFormErrors({});
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-gray-500">Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      {submitSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          Profile updated successfully
        </div>
      )}

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.display_name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">No Avatar</span>
                </div>
              )}
              <h2 className="text-xl font-medium text-gray-900 mb-1">
                {formData.display_name}
              </h2>
              <p className="text-gray-500 mb-4">@{formData.display_name?.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="display_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Display Name *
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  className={`input ${formErrors.display_name ? 'border-red-500' : ''}`}
                  value={formData.display_name || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                {formErrors.display_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.display_name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="input"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">Select a gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer Not To Say</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="avatar_url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Avatar URL
                </label>
                <input
                  type="url"
                  id="avatar_url"
                  name="avatar_url"
                  className={`input ${formErrors.avatar_url ? 'border-red-500' : ''}`}
                  value={formData.avatar_url || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={isSubmitting}
                />
                {formErrors.avatar_url && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.avatar_url}</p>
                )}
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
                  name="bio"
                  rows={4}
                  className={`input ${formErrors.bio ? 'border-red-500' : ''}`}
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                {formErrors.bio && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.bio}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{formData.bio?.length || 0} / 1000</p>
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
                  name="hobbies"
                  className={`input ${formErrors.hobbies ? 'border-red-500' : ''}`}
                  value={formData.hobbies || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Hiking, Photography, Coding"
                  disabled={isSubmitting}
                />
                {formErrors.hobbies && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.hobbies}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{formData.hobbies?.length || 0} / 1000</p>
              </div>

              <div>
                <label
                  htmlFor="favorite_joke"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Favorite Joke
                </label>
                <textarea
                  id="favorite_joke"
                  name="favorite_joke"
                  rows={3}
                  className={`input ${formErrors.favorite_joke ? 'border-red-500' : ''}`}
                  value={formData.favorite_joke || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                {formErrors.favorite_joke && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.favorite_joke}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{formData.favorite_joke?.length || 0} / 500</p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !profile}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
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
