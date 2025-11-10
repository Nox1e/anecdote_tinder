// Error response from API
export interface ApiError {
  detail: string;
  status: number;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Profile types
export interface Profile {
  id: number;
  user_id: number;
  display_name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  avatar_url?: string;
  bio?: string;
  hobbies?: string;
  favorite_joke?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Profile update types
export interface ProfileUpdateRequest {
  display_name?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
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
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
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
