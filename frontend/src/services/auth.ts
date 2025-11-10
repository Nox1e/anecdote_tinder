import { ApiError, AuthResponse, AuthUser, LoginRequest, MessageResponse, RegisterRequest } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const AUTH_TOKEN_KEY = 'auth_token';

export class AuthError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

const parseErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AuthError) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'detail' in error) {
    const detail = (error as ApiError).detail;
    if (typeof detail === 'string') {
      return detail;
    }
  }
  return fallback;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response
    .json()
    .catch(() => null as unknown);

  if (!response.ok) {
    const message = parseErrorMessage(
      data,
      'Unable to process authentication request'
    );
    throw new AuthError(message, response.status);
  }

  return data as T;
};

const buildHeaders = (includeAuth: boolean): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getSessionToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const request = async <T>(
  path: string,
  init: RequestInit = {},
  { includeAuth = true }: { includeAuth?: boolean } = {}
): Promise<T> => {
  const headers: HeadersInit = {
    ...buildHeaders(includeAuth),
    ...(init.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  return handleResponse<T>(response);
};

export const getSessionToken = (): string | null => {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const setSessionToken = (token: string): void => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearSessionToken = (): void => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await request<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      { includeAuth: false }
    );

    setSessionToken(response.token);
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await request<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      { includeAuth: false }
    );

    setSessionToken(response.token);
    return response;
  },

  async getCurrentUser(): Promise<AuthUser> {
    return request<AuthUser>('/auth/me');
  },

  async logout(): Promise<MessageResponse | void> {
    try {
      return await request<MessageResponse>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      clearSessionToken();
    }
  },

  clearSession: clearSessionToken,
  getSessionToken,
};

export const authTokenKey = AUTH_TOKEN_KEY;
