export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: 'boyfriend' | 'player' | 'lifetime'
          subscription_status: 'active' | 'cancelled' | 'expired'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          subscription_tier?: 'boyfriend' | 'player' | 'lifetime'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: 'boyfriend' | 'player' | 'lifetime'
          subscription_status?: 'active' | 'cancelled' | 'expired'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      girls: {
        Row: {
          id: string
          user_id: string
          name: string
          age: number
          rating: number
          ethnicity: string | null
          hair_color: string | null
          location_city: string | null
          location_country: string | null
          nationality: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          age: number
          rating?: number
          ethnicity?: string | null
          hair_color?: string | null
          location_city?: string | null
          location_country?: string | null
          nationality?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          age?: number
          rating?: number
          ethnicity?: string | null
          hair_color?: string | null
          location_city?: string | null
          location_country?: string | null
          nationality?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      data_entries: {
        Row: {
          id: string
          user_id: string
          girl_id: string
          date: string
          amount_spent: number
          duration_minutes: number
          number_of_nuts: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          girl_id: string
          date: string
          amount_spent: number
          duration_minutes: number
          number_of_nuts: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          girl_id?: string
          date?: string
          amount_spent?: number
          duration_minutes?: number
          number_of_nuts?: number
          created_at?: string
          updated_at?: string
        }
      }
      onboarding_sessions: {
        Row: {
          id: string
          session_token: string
          girl_data: Json | null
          data_entries: Json
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_token: string
          girl_data?: Json | null
          data_entries?: Json
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          girl_data?: Json | null
          data_entries?: Json
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_girl_metrics: {
        Args: {
          girl_uuid: string
        }
        Returns: {
          total_spent: number
          total_nuts: number
          total_minutes: number
          cost_per_nut: number
          time_per_nut: number
          entry_count: number
        }[]
      }
      get_girls_with_metrics: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          user_id: string
          name: string
          age: number
          rating: number
          ethnicity: string | null
          hair_color: string | null
          location_city: string | null
          location_country: string | null
          nationality: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          total_spent: number
          total_nuts: number
          total_minutes: number
          cost_per_nut: number
          time_per_nut: number
          entry_count: number
        }[]
      }
      migrate_onboarding_session: {
        Args: {
          session_token: string
          target_user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}