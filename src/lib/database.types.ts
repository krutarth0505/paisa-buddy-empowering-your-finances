// Database types for Supabase
// These types match the Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          category: string;
          amount: number;
          date: string;
          type: 'Essentials' | 'Needs' | 'Wants' | 'Income';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          category: string;
          amount: number;
          date: string;
          type: 'Essentials' | 'Needs' | 'Wants' | 'Income';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          category?: string;
          amount?: number;
          date?: string;
          type?: 'Essentials' | 'Needs' | 'Wants' | 'Income';
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          type: string;
          current: number;
          target: number;
          deadline: string | null;
          monthly_target: number;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          type: string;
          current?: number;
          target: number;
          deadline?: string | null;
          monthly_target?: number;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          current?: number;
          target?: number;
          deadline?: string | null;
          monthly_target?: number;
          color?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: number;
          user_id: string;
          category: string;
          limit: number;
          period: 'monthly' | 'weekly';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          category: string;
          limit: number;
          period?: 'monthly' | 'weekly';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          limit?: number;
          period?: 'monthly' | 'weekly';
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: number;
          user_id: string;
          currency: string;
          currency_symbol: string;
          date_format: string;
          notifications: boolean;
          weekly_report: boolean;
          budget_alerts: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          currency?: string;
          currency_symbol?: string;
          date_format?: string;
          notifications?: boolean;
          weekly_report?: boolean;
          budget_alerts?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          currency?: string;
          currency_symbol?: string;
          date_format?: string;
          notifications?: boolean;
          weekly_report?: boolean;
          budget_alerts?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_type: 'Essentials' | 'Needs' | 'Wants' | 'Income';
      budget_period: 'monthly' | 'weekly';
    };
  };
}

// Convenience type exports
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
