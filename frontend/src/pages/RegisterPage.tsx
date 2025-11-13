import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z
  .object({
    email: z.string().email('Пожалуйста, введите корректный email'),
    username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
    password: z
      .string()
      .min(6, 'Пароль должен быть не менее 6 символов')
      .max(100, 'Пароль должен быть менее 100 символов'),
    confirmPassword: z.string().min(6, 'Пожалуйста, подтвердите пароль'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Пароли должны совпадать',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M17.66,11.2C17.43,10.9 17.15,10.64 16.89,10.38C16.22,9.78 15.46,9.35 14.82,8.72C13.33,7.26 13,4.85 13.95,3C13,3.23 12.17,3.75 11.46,4.32C8.87,6.4 7.85,10.07 9.07,13.22C9.11,13.32 9.15,13.42 9.15,13.55C9.15,13.77 9,13.97 8.8,14.05C8.57,14.15 8.33,14.09 8.14,13.93C8.08,13.88 8.04,13.83 8,13.76C6.87,12.33 6.69,10.28 7.45,8.64C5.78,10 4.87,12.3 5,14.47C5.06,14.97 5.12,15.47 5.29,15.97C5.43,16.57 5.7,17.17 6,17.7C7.08,19.43 8.95,20.67 10.96,20.92C13.1,21.19 15.39,20.8 17.03,19.32C18.86,17.66 19.5,15 18.56,12.72L18.43,12.46C18.22,12 17.66,11.2 17.66,11.2M14.5,17.5C14.22,17.74 13.76,18 13.4,18.1C12.28,18.5 11.16,17.94 10.5,17.28C11.69,17 12.4,16.12 12.61,15.23C12.78,14.43 12.46,13.77 12.33,13C12.21,12.26 12.23,11.63 12.5,10.94C12.69,11.32 12.89,11.7 13.13,12C13.9,13 15.11,13.44 15.37,14.8C15.41,14.94 15.43,15.08 15.43,15.23C15.46,16.05 15.1,16.95 14.5,17.5Z" />
  </svg>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register: registerUser,
    loading,
    error,
    isAuthenticated,
    clearError,
  } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (error) {
      setError('root', {
        type: 'server',
        message: error,
      });
    } else {
      clearErrors('root');
    }
  }, [error, setError, clearErrors]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser({
        email: values.email,
        username: values.username,
        password: values.password,
      });
      navigate('/search', { replace: true });
    } catch {
      // Errors handled via auth store state
    }
  };

  const submitting = isSubmitting || loading;

  if (isAuthenticated) {
    return <Navigate to="/search" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-tinder-light">
      <div className="container py-12 lg:py-20">
        <div className="grid lg:grid-cols-[440px,1fr] gap-12 items-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-tinder-xl p-8 sm:p-10 space-y-8 order-2 lg:order-1">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-tinder-orange text-white shadow-tinder-lg mb-3">
                <FlameIcon />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Создайте аккаунт</h2>
              <p className="text-sm text-gray-500">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-400">
                  Войти
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Электронная почта
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`input ${errors.email ? 'border-red-400 focus:ring-red-200' : ''}`}
                    {...register('email', {
                      onChange: () => {
                        if (error) {
                          clearError();
                        }
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-semibold text-gray-700">
                    Имя пользователя
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    className={`input ${errors.username ? 'border-red-400 focus:ring-red-200' : ''}`}
                    {...register('username', {
                      onChange: () => {
                        if (error) {
                          clearError();
                        }
                      },
                    })}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-500 font-medium">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className={`input ${errors.password ? 'border-red-400 focus:ring-red-200' : ''}`}
                    {...register('password', {
                      onChange: () => {
                        if (error) {
                          clearError();
                        }
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Подтвердите пароль
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={`input ${errors.confirmPassword ? 'border-red-400 focus:ring-red-200' : ''}`}
                    {...register('confirmPassword', {
                      onChange: () => {
                        if (error) {
                          clearError();
                        }
                      },
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {errors.root && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
                  {errors.root.message}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full py-3 text-base"
                disabled={submitting}
              >
                {submitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center">
              Мы не отправляем письма — просто создайте аккаунт и начинайте свайпить.
            </p>
          </div>

          <div className="order-1 lg:order-2 hidden lg:flex flex-col space-y-8 text-gray-900">
            <div className="bg-gradient-to-br from-primary-500/90 via-tinder-orange/90 to-tinder-pink/90 text-white rounded-3xl shadow-tinder-xl p-10 space-y-6">
              <div className="flex items-center space-x-3 text-white/90">
                <FlameIcon />
                <span className="uppercase tracking-[0.3em] text-sm">tinder vibes</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight">Псевдо-Tinder, настоящие эмоции</h1>
              <p className="text-sm text-white/80">
                Создайте профиль с любимыми анекдотами и смотрите, кто оценит ваше чувство юмора. Каждое совпадение — это повод для новой шутки.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-tinder">
                <p className="text-sm font-semibold text-gray-900">💘 Совпадения в реальном времени</p>
                <p className="text-xs text-gray-600 mt-1">Узнавайте, кто поставил взаимный лайк мгновенно.</p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-3xl p-4 shadow-tinder">
                <p className="text-sm font-semibold text-gray-900">🎭 Настоящее "свайп" настроение</p>
                <p className="text-xs text-gray-600 mt-1">Интерфейс вдохновлён оригинальным Tinder.</p>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-3xl p-4 shadow-tinder">
                <p className="text-sm font-semibold text-gray-900">😂 Анекдоты на первом месте</p>
                <p className="text-xs text-gray-600 mt-1">Покажите, что умеете развеселить собеседника.</p>
              </div>
              <div className="bg-white/90 backdrop-blur rounded-3xl p-4 shadow-tinder">
                <p className="text-sm font-semibold text-gray-900">🧪 Учебный проект</p>
                <p className="text-xs text-gray-600 mt-1">Без обязательств, но с максимумом удовольствия.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
