export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    subscription_tier: string | null;
                    subscription_status: string | null;
                    stripe_customer_id: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    email: string;
                    subscription_tier?: string | null;
                    subscription_status?: string | null;
                    stripe_customer_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    subscription_tier?: string | null;
                    subscription_status?: string | null;
                    stripe_customer_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            girls: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    age: number;
                    rating: number;
                    ethnicity: string | null;
                    hair_color: string | null;
                    location_city: string | null;
                    location_country: string | null;
                    nationality: string | null;
                    is_active: boolean | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    name: string;
                    age: number;
                    rating?: number;
                    ethnicity?: string | null;
                    hair_color?: string | null;
                    location_city?: string | null;
                    location_country?: string | null;
                    nationality?: string | null;
                    is_active?: boolean | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    name?: string;
                    age?: number;
                    rating?: number;
                    ethnicity?: string | null;
                    hair_color?: string | null;
                    location_city?: string | null;
                    location_country?: string | null;
                    nationality?: string | null;
                    is_active?: boolean | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "girls_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            data_entries: {
                Row: {
                    id: string;
                    user_id: string | null;
                    girl_id: string | null;
                    date: string;
                    amount_spent: number;
                    duration_minutes: number;
                    number_of_nuts: number;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    girl_id?: string | null;
                    date: string;
                    amount_spent: number;
                    duration_minutes: number;
                    number_of_nuts: number;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    girl_id?: string | null;
                    date?: string;
                    amount_spent?: number;
                    duration_minutes?: number;
                    number_of_nuts?: number;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "data_entries_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "data_entries_girl_id_fkey";
                        columns: ["girl_id"];
                        isOneToOne: false;
                        referencedRelation: "girls";
                        referencedColumns: ["id"];
                    }
                ];
            };
            onboarding_sessions: {
                Row: {
                    id: string;
                    session_token: string;
                    girl_data: Json | null;
                    data_entries: Json | null;
                    expires_at: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    session_token: string;
                    girl_data?: Json | null;
                    data_entries?: Json | null;
                    expires_at?: string | null;
                    created_at?: string | null;
                };
                Update: {
                    id?: string;
                    session_token?: string;
                    girl_data?: Json | null;
                    data_entries?: Json | null;
                    expires_at?: string | null;
                    created_at?: string | null;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
export type Tables<PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"]) | {
    schema: keyof Database;
}, TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"]) : never = never> = PublicTableNameOrOptions extends {
    schema: keyof Database;
} ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"]) ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | {
    schema: keyof Database;
}, TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"] : never = never> = PublicTableNameOrOptions extends {
    schema: keyof Database;
} ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : PublicTableNameOrOptions extends keyof Database["public"]["Tables"] ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | {
    schema: keyof Database;
}, TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"] : never = never> = PublicTableNameOrOptions extends {
    schema: keyof Database;
} ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : PublicTableNameOrOptions extends keyof Database["public"]["Tables"] ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type Enums<PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | {
    schema: keyof Database;
}, EnumName extends PublicEnumNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"] : never = never> = PublicEnumNameOrOptions extends {
    schema: keyof Database;
} ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName] : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] ? Database["public"]["Enums"][PublicEnumNameOrOptions] : never;
