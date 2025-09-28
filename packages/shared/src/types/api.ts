// API request/response types for CPN App
import { Girl, DataEntry, User, GirlWithMetrics } from './database';

// Input types for creating records
export interface CreateGirlInput {
  name: string;
  age: number;
  rating?: number;
  ethnicity?: string;
  hair_color?: string;
  location_city?: string;
  location_country?: string;
  nationality?: string;
}

export interface CreateDataEntryInput {
  girl_id: string;
  date: string;
  amount_spent: number;
  duration_minutes: number;
  number_of_nuts: number;
}

export interface CreateUserInput {
  email: string;
  subscription_tier?: 'boyfriend' | 'player' | 'lifetime';
  stripe_customer_id?: string;
}

// Update types
export interface UpdateGirlInput {
  name?: string;
  age?: number;
  rating?: number;
  ethnicity?: string;
  hair_color?: string;
  location_city?: string;
  location_country?: string;
  nationality?: string;
  is_active?: boolean;
}

export interface UpdateDataEntryInput {
  date?: string;
  amount_spent?: number;
  duration_minutes?: number;
  number_of_nuts?: number;
}

export interface UpdateUserInput {
  subscription_tier?: 'boyfriend' | 'player' | 'lifetime';
  subscription_status?: 'active' | 'cancelled' | 'expired';
  stripe_customer_id?: string;
}

// Authentication types
export interface SignUpInput {
  email: string;
  password: string;
  session_token?: string; // For onboarding data migration
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// Onboarding session types
export interface CreateOnboardingSessionResponse {
  session_token: string;
  expires_at: string;
}

export interface AddGirlToSessionInput {
  session_token: string;
  girl_data: Partial<CreateGirlInput>;
}

export interface AddDataToSessionInput {
  session_token: string;
  data_entry: Partial<CreateDataEntryInput>;
}

// Subscription types
export interface CreateCheckoutSessionInput {
  tier: 'player' | 'lifetime';
  user_id: string;
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    request_id: string;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  request_id: string;
}

// Common API responses
export type GetGirlsResponse = ApiResponse<GirlWithMetrics[]>;
export type GetGirlResponse = ApiResponse<GirlWithMetrics>;
export type CreateGirlResponse = ApiResponse<Girl>;
export type UpdateGirlResponse = ApiResponse<Girl>;
export type DeleteGirlResponse = ApiResponse<{ success: boolean }>;

export type GetDataEntriesResponse = ApiResponse<DataEntry[]>;
export type GetDataEntryResponse = ApiResponse<DataEntry>;
export type CreateDataEntryResponse = ApiResponse<DataEntry>;
export type UpdateDataEntryResponse = ApiResponse<DataEntry>;
export type DeleteDataEntryResponse = ApiResponse<{ success: boolean }>;

export type GetUserResponse = ApiResponse<User>;
export type UpdateUserResponse = ApiResponse<User>;

// Global statistics
export interface GlobalStatistics {
  total_girls: number;
  total_spent: number;
  total_nuts: number;
  total_minutes: number;
  average_cost_per_nut: number;
  average_time_per_nut: number;
  total_entries: number;
}

export type GetGlobalStatisticsResponse = ApiResponse<GlobalStatistics>;