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
      errors.display_name = 'Отображаемое имя обязательно';
    } else if (formData.display_name.length > 255) {
      errors.display_name = 'Отображаемое имя должно быть не более 255 символов';
    }

    if (formData.avatar_url && formData.avatar_url.length > 500) {
      errors.avatar_url = 'URL аватара должен быть не более 500 символов';
    }

    if (formData.bio && formData.bio.length > 1000) {
      errors.bio = 'О себе должно быть не более 1000 символов';
    }

    if (formData.hobbies && formData.hobbies.length > 1000) {
      errors.hobbies = 'Увлечения должны быть не более 1000 символов';
    }

    if (formData.favorite_joke && formData.favorite_joke.length > 500) {
      errors.favorite_joke = 'Любимый анекдот должен быть не более 500 символов';
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
      const message = err instanceof AuthError ? err.message : 'Не удалось обновить профиль';
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
      <div className="container max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-tinder-orange rounded-full mx-auto mb-4" />
            <p className="text-sm text-gray-600">Загружаем ваш профиль…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-tinder-orange bg-clip-text text-transparent mb-2">
            Мой профиль
          </h1>
          <p className="text-gray-600">Управляйте информацией о своём профиле</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl p-6 shadow-tinder-xl">
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-tinder-orange bg-clip-text text-transparent mb-2">
          Мой профиль
        </h1>
        <p className="text-gray-600">Редактируйте профиль, чтобы показать себя с лучшей стороны</p>
      </div>

      {submitSuccess && (
        <div className="mb-6 bg-gradient-to-r from-green-400 to-tinder-coral text-white rounded-3xl p-5 shadow-tinder-xl animate-bounce-in">
          <p className="font-bold text-center">✨ Профиль успешно обновлён!</p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl p-5 shadow-tinder-xl animate-bounce-in">
          <p className="font-bold text-center">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
        {/* Profile Preview */}
        <div className="card text-center">
          <div className="relative inline-block mb-4">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt={formData.display_name}
                className="w-32 h-32 rounded-full mx-auto object-cover shadow-tinder-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-primary-200 to-tinder-coral rounded-full mx-auto flex items-center justify-center text-5xl font-bold text-white shadow-tinder-lg">
                {formData.display_name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-tinder-orange rounded-full flex items-center justify-center text-white shadow-tinder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {formData.display_name}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            @{formData.display_name?.toLowerCase().replace(/\s+/g, '') || 'username'}
          </p>
          
          {formData.bio && (
            <div className="bg-gray-50 rounded-2xl p-3 mb-3 text-left">
              <p className="text-xs text-gray-600 line-clamp-3">{formData.bio}</p>
            </div>
          )}

          <div className="pill">Preview Card</div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="display_name" className="text-sm font-semibold text-gray-700">
                Отображаемое имя *
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                className={`input ${formErrors.display_name ? 'border-red-400 focus:ring-red-200' : ''}`}
                value={formData.display_name || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {formErrors.display_name && (
                <p className="text-xs text-red-500 font-medium">{formErrors.display_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                Пол
              </label>
              <select
                id="gender"
                name="gender"
                className="input"
                value={formData.gender || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="">Выберите пол</option>
                <option value="male">Мужчина</option>
                <option value="female">Женщина</option>
                <option value="other">Другое</option>
                <option value="prefer_not_to_say">Предпочитаю не указывать</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="avatar_url" className="text-sm font-semibold text-gray-700">
                URL аватара
              </label>
              <input
                type="url"
                id="avatar_url"
                name="avatar_url"
                className={`input ${formErrors.avatar_url ? 'border-red-400 focus:ring-red-200' : ''}`}
                value={formData.avatar_url || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/avatar.jpg"
                disabled={isSubmitting}
              />
              {formErrors.avatar_url && (
                <p className="text-xs text-red-500 font-medium">{formErrors.avatar_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                О себе
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className={`input ${formErrors.bio ? 'border-red-400 focus:ring-red-200' : ''}`}
                value={formData.bio || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {formErrors.bio && (
                <p className="text-xs text-red-500 font-medium">{formErrors.bio}</p>
              )}
              <p className="text-xs text-gray-500">{formData.bio?.length || 0} / 1000 символов</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="hobbies" className="text-sm font-semibold text-gray-700">
                Увлечения и интересы
              </label>
              <input
                type="text"
                id="hobbies"
                name="hobbies"
                className={`input ${formErrors.hobbies ? 'border-red-400 focus:ring-red-200' : ''}`}
                value={formData.hobbies || ''}
                onChange={handleInputChange}
                placeholder="например: прогулки, фотография, программирование"
                disabled={isSubmitting}
              />
              {formErrors.hobbies && (
                <p className="text-xs text-red-500 font-medium">{formErrors.hobbies}</p>
              )}
              <p className="text-xs text-gray-500">{formData.hobbies?.length || 0} / 1000 символов</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="favorite_joke" className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                <span>😂</span>
                <span>Любимый анекдот</span>
              </label>
              <textarea
                id="favorite_joke"
                name="favorite_joke"
                rows={3}
                className={`input ${formErrors.favorite_joke ? 'border-red-400 focus:ring-red-200' : ''}`}
                value={formData.favorite_joke || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {formErrors.favorite_joke && (
                <p className="text-xs text-red-500 font-medium">{formErrors.favorite_joke}</p>
              )}
              <p className="text-xs text-gray-500">{formData.favorite_joke?.length || 0} / 500 символов</p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isSubmitting || !profile}
              >
                {isSubmitting ? 'Сохраняем...' : 'Сохранить изменения'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
