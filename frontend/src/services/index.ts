import apiClient from './api';
import { authService } from './auth';
import {
  Profile,
  ProfileUpdateRequest,
  FeedResponse,
  Like,
  Match,
  MessageResponse,
} from '@/types/api';

export { authService };

export const profileService = {
  async getMyProfile(): Promise<Profile> {
    return apiClient.get<Profile>('/profile/me');
  },

  async updateMyProfile(data: ProfileUpdateRequest): Promise<Profile> {
    return apiClient.put<Profile>('/profile/me', data);
  },

  async getPublicProfile(userId: number): Promise<Profile> {
    return apiClient.get<Profile>(`/profile/profiles/${userId}`);
  },
};

export const likesService = {
  async getFeed(page: number = 1, size: number = 10): Promise<FeedResponse> {
    return apiClient.get<FeedResponse>(`/likes/feed?page=${page}&size=${size}`);
  },

  async likeUser(targetId: number): Promise<Like> {
    return apiClient.post<Like>(`/likes/${targetId}`);
  },

  async getMatches(): Promise<Match[]> {
    return apiClient.get<Match[]>(`/likes/matches`);
  },
};

export const settingsService = {
  async closeProfile(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/settings/close-profile');
  },

  async reopenProfile(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>('/settings/reopen-profile');
  },
};
