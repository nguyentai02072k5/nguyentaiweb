// AUTO-GENERATED from Supabase schema via Management API.
// Source: project hiocvsfjssqozovdmfas (vantai's Project)
// Regenerate: see docs/supabase-setup.md → Bước 5
// DO NOT EDIT MANUALLY.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blocked_periods: {
        Row: {
          created_at: string
          end_at: string
          id: string
          reason: string | null
          start_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          reason?: string | null
          start_at: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          reason?: string | null
          start_at?: string
        }
        Relationships: []
      }
      booking_config: {
        Row: {
          block_hours_forward: number
          curation_skip_hours: number[]
          default_duration_minutes: number
          id: number
          min_advance_minutes: number
          owner_zalo_phone: string | null
          slot_interval_minutes: number
          updated_at: string
        }
        Insert: {
          block_hours_forward?: number
          curation_skip_hours?: number[]
          default_duration_minutes?: number
          id?: number
          min_advance_minutes?: number
          owner_zalo_phone?: string | null
          slot_interval_minutes?: number
          updated_at?: string
        }
        Update: {
          block_hours_forward?: number
          curation_skip_hours?: number[]
          default_duration_minutes?: number
          id?: number
          min_advance_minutes?: number
          owner_zalo_phone?: string | null
          slot_interval_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          consent_zalo: boolean
          created_at: string
          duration_minutes: number
          email: string | null
          expectation_other: string | null
          expectations: string[]
          full_name: string | null
          id: string
          ip_hash: string | null
          meet_link: string | null
          meet_platform: string
          meeting_end: string
          meeting_start: string
          notes: string | null
          phone_zalo: string
          source: string | null
          status: string
          updated_at: string
          user_agent: string | null
          zalo_notified_at: string | null
          zalo_notify_error: string | null
        }
        Insert: {
          consent_zalo?: boolean
          created_at?: string
          duration_minutes?: number
          email?: string | null
          expectation_other?: string | null
          expectations?: string[]
          full_name?: string | null
          id?: string
          ip_hash?: string | null
          meet_link?: string | null
          meet_platform?: string
          meeting_end: string
          meeting_start: string
          notes?: string | null
          phone_zalo: string
          source?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          zalo_notified_at?: string | null
          zalo_notify_error?: string | null
        }
        Update: {
          consent_zalo?: boolean
          created_at?: string
          duration_minutes?: number
          email?: string | null
          expectation_other?: string | null
          expectations?: string[]
          full_name?: string | null
          id?: string
          ip_hash?: string | null
          meet_link?: string | null
          meet_platform?: string
          meeting_end?: string
          meeting_start?: string
          notes?: string | null
          phone_zalo?: string
          source?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          zalo_notified_at?: string | null
          zalo_notify_error?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      booking_block_range: { Args: { start_ts: string }; Returns: unknown }
      create_booking: {
        Args: {
          p_email?: string
          p_expectation_other?: string
          p_expectations?: string[]
          p_full_name?: string
          p_ip_hash?: string
          p_meeting_start: string
          p_phone_zalo: string
          p_source?: string
          p_user_agent?: string
        }
        Returns: {
          id: string
          meeting_end: string
          meeting_start: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
