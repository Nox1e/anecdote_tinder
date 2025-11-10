// Error response from API
export interface ApiError {
  detail: string;
  status?: number;
}

// Authentication types
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export type User = AuthUser;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface MessageResponse {
  message: string;
}

// Profile types
export interface Profile {
  id: number;
  user_id: number;
  display_name: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar_url?: string;
  bio?: string;
  hobbies?: string;
  favorite_joke?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateRequest {
  display_name?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar_url?: string;
  bio?: string;
  hobbies?: string;
  favorite_joke?: string;
}

// Like types
export interface Like {
  id: number;
  liker_id: number;
  target_id: number;
  mutual: boolean;
  created_at: string;
  updated_at: string;
}

// Feed types
export interface FeedProfile {
  id: number;
  user_id: number;
  display_name: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  avatar_url?: string;
  favorite_joke?: string;
}

export interface FeedResponse {
  profiles: FeedProfile[];
  total: number;
  page: number;
  size: number;
}

// Match types
export interface Match {
  user_id: number;
  display_name: string;
  avatar_url?: string;
  favorite_joke?: string;
}
