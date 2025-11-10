import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { clearSessionToken, getSessionToken, setSessionToken } from './auth';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      config => {
        const token = getSessionToken();
        if (token) {
          if (!config.headers) {
            config.headers = {};
          }

          if (typeof (config.headers as unknown as { set?: unknown }).set === 'function') {
            (config.headers as unknown as { set: (name: string, value: string) => void }).set(
              'Authorization',
              `Bearer ${token}`
            );
          } else {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          clearSessionToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic GET request
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  // Generic POST request
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  // Generic PUT request
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  // Generic DELETE request
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Set auth token
  setAuthToken(token: string) {
    setSessionToken(token);
  }

  // Clear auth token
  clearAuthToken() {
    clearSessionToken();
  }

  // Get current auth token
  getAuthToken(): string | null {
    return getSessionToken();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
