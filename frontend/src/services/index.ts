import apiClient from './api';
import { authService } from './auth';
import {
  Profile,
  ProfileUpdateRequest,
  FeedResponse,
  LikeResponse,
  MatchesResponse,
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

export const feedService = {
  async getFeed(page: number = 1, size: number = 10): Promise<FeedResponse> {
    return apiClient.get<FeedResponse>(`/feed?page=${page}&size=${size}`);
  },

  async likeProfile(targetId: number): Promise<LikeResponse> {
    return apiClient.post<LikeResponse>(`/feed/${targetId}/like`);
  },

  async getMatches(): Promise<MatchesResponse> {
    return apiClient.get<MatchesResponse>(`/feed/matches`);
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
