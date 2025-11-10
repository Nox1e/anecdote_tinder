import apiClient from './api';
import {
  User,
  Profile,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProfileUpdateRequest,
  Like,
  FeedResponse,
  Match,
} from '@/types/api';

// Auth services
export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      credentials
    );
    apiClient.setAuthToken(response.access_token);
    return response;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      userData
    );
    apiClient.setAuthToken(response.access_token);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/auth/me');
  },

  logout() {
    apiClient.clearAuthToken();
  },
};

// Profile services
export const profileService = {
  async getMyProfile(): Promise<Profile> {
    return apiClient.get<Profile>('/api/profile/me');
  },

  async updateMyProfile(data: ProfileUpdateRequest): Promise<Profile> {
    return apiClient.put<Profile>('/api/profile/me', data);
  },

  async getPublicProfile(userId: number): Promise<Profile> {
    return apiClient.get<Profile>(`/api/profile/profiles/${userId}`);
  },
};

// Likes services
export const likesService = {
  async getFeed(page: number = 1, size: number = 10): Promise<FeedResponse> {
    return apiClient.get<FeedResponse>(
      `/api/likes/feed?page=${page}&size=${size}`
    );
  },

  async likeUser(targetId: number): Promise<Like> {
    return apiClient.post<Like>(`/api/likes/${targetId}`);
  },

  async getMatches(): Promise<Match[]> {
    return apiClient.get<Match[]>('/api/likes/matches');
  },
};

// Settings services
export const settingsService = {
  async closeProfile(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/api/settings/close-profile');
  },
};
