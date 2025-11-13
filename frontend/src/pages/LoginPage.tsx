import { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Пожалуйста, введите корректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M17.66,11.2C17.43,10.9 17.15,10.64 16.89,10.38C16.22,9.78 15.46,9.35 14.82,8.72C13.33,7.26 13,4.85 13.95,3C13,3.23 12.17,3.75 11.46,4.32C8.87,6.4 7.85,10.07 9.07,13.22C9.11,13.32 9.15,13.42 9.15,13.55C9.15,13.77 9,13.97 8.8,14.05C8.57,14.15 8.33,14.09 8.14,13.93C8.08,13.88 8.04,13.83 8,13.76C6.87,12.33 6.69,10.28 7.45,8.64C5.78,10 4.87,12.3 5,14.47C5.06,14.97 5.12,15.47 5.29,15.97C5.43,16.57 5.7,17.17 6,17.7C7.08,19.43 8.95,20.67 10.96,20.92C13.1,21.19 15.39,20.8 17.03,19.32C18.86,17.66 19.5,15 18.56,12.72L18.43,12.46C18.22,12 17.66,11.2 17.66,11.2M14.5,17.5C14.22,17.74 13.76,18 13.4,18.1C12.28,18.5 11.16,17.94 10.5,17.28C11.69,17 12.4,16.12 12.61,15.23C12.78,14.43 12.46,13.77 12.33,13C12.21,12.26 12.23,11.63 12.5,10.94C12.69,11.32 12.89,11.7 13.13,12C13.9,13 15.11,13.44 15.37,14.8C15.41,14.94 15.43,15.08 15.43,15.23C15.46,16.05 15.1,16.95 14.5,17.5Z" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    login,
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
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

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      navigate('/search', { replace: true });
    } catch {
      // Errors are handled via auth store state
    }
  };

  const submitting = isSubmitting || loading;

  if (isAuthenticated) {
    return <Navigate to="/search" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tinder-peach via-white to-tinder-light">
      <div className="container py-12 lg:py-20">
        <div className="grid lg:grid-cols-[1fr,420px] gap-12 items-center">
          <div className="hidden lg:flex flex-col space-y-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-primary-500">
                <FlameIcon />
                <span className="text-lg font-semibold uppercase tracking-[0.2em]">tinder</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Свайпайте, встречайте, смейтесь.
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                Anecdotinder приносит Tinder-опыт в мир анекдотов. Войдите, чтобы продолжить знакомиться и находить взаимные симпатии.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex-1 bg-white/70 backdrop-blur rounded-3xl p-4 shadow-tinder">
                <p className="text-sm font-semibold text-gray-900">💬 Мэтч = повод для шуток</p>
                <p className="text-sm text-gray-600 mt-2">
                  Делитесь любимыми шутками и находите тех, кто смеётся вместе с вами.
                </p>
              </div>
              <div className="flex-1 bg-white/90 backdrop-blur rounded-3xl p-4 shadow-tinder">
                <p className="text-sm font-semibold text-gray-900">🔥 Точно как Tinder</p>
                <p className="text-sm text-gray-600 mt-2">
                  Узнайте, кто вам симпатизирует, и создайте идеальное совпадение.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-tinder-xl p-8 sm:p-10 space-y-8">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-tinder-orange text-white shadow-tinder-lg mb-3">
                <FlameIcon />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Войдите в аккаунт</h2>
              <p className="text-sm text-gray-500">
                Нет аккаунта?{' '}
                <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-400">
                  Зарегистрируйтесь
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
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
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
                {submitting ? 'Входим…' : 'Войти'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center">
              Продолжая, вы подтверждаете, что это учебный проект, созданный ради эксперимента.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
