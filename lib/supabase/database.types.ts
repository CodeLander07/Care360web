/**
 * Supabase Database Types - Care360
 * Generate with: npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
 * For now, manual types for schema alignment.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "patient" | "doctor" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: UserRole;
          has_password: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: UserRole;
          has_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          role?: UserRole;
          has_password?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          user_id: string;
          summary: string | null;
          transcript: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          summary?: string | null;
          transcript?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          summary?: string | null;
          transcript?: string | null;
          created_at?: string;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          risk_score: number | null;
          sentiment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          risk_score?: number | null;
          sentiment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          risk_score?: number | null;
          sentiment?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
