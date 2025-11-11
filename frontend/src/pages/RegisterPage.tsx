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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Создайте аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Или{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              войдите в существующий аккаунт
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Электронная почта
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 input"
                {...register('email', {
                  onChange: () => {
                    if (error) {
                      clearError();
                    }
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="mt-1 input"
                {...register('username', {
                  onChange: () => {
                    if (error) {
                      clearError();
                    }
                  },
                })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-1 input"
                {...register('password', {
                  onChange: () => {
                    if (error) {
                      clearError();
                    }
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="mt-1 input"
                {...register('confirmPassword', {
                  onChange: () => {
                    if (error) {
                      clearError();
                    }
                  },
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
