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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          physiotherapist_id: string
          session_type: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          physiotherapist_id: string
          session_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          physiotherapist_id?: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_physiotherapist_id_fkey"
            columns: ["physiotherapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          chronicity: string | null
          created_at: string | null
          data: Json | null
          functional_score: number | null
          id: string
          language: string | null
          pain_level: number | null
          patient_user_id: string
          red_flag: boolean | null
          region: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          chronicity?: string | null
          created_at?: string | null
          data?: Json | null
          functional_score?: number | null
          id?: string
          language?: string | null
          pain_level?: number | null
          patient_user_id: string
          red_flag?: boolean | null
          region?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          chronicity?: string | null
          created_at?: string | null
          data?: Json | null
          functional_score?: number | null
          id?: string
          language?: string | null
          pain_level?: number | null
          patient_user_id?: string
          red_flag?: boolean | null
          region?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          patient_id: string
          physiotherapist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          patient_id: string
          physiotherapist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          patient_id?: string
          physiotherapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_physiotherapist_id_fkey"
            columns: ["physiotherapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          step: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          step?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          step?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ergonomic_assessments: {
        Row: {
          answers: Json | null
          chair_score: number | null
          created_at: string | null
          habits_score: number | null
          id: string
          monitor_score: number | null
          peripherals_score: number | null
          risk_score: number | null
          tips: Json | null
          user_id: string
          zone: string | null
        }
        Insert: {
          answers?: Json | null
          chair_score?: number | null
          created_at?: string | null
          habits_score?: number | null
          id?: string
          monitor_score?: number | null
          peripherals_score?: number | null
          risk_score?: number | null
          tips?: Json | null
          user_id: string
          zone?: string | null
        }
        Update: {
          answers?: Json | null
          chair_score?: number | null
          created_at?: string | null
          habits_score?: number | null
          id?: string
          monitor_score?: number | null
          peripherals_score?: number | null
          risk_score?: number | null
          tips?: Json | null
          user_id?: string
          zone?: string | null
        }
        Relationships: []
      }
      exercise_programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          program: Json | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          program?: Json | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          program?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          link: string | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          link?: string | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          link?: string | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      office_profiles: {
        Row: {
          created_at: string | null
          desk_hours_per_day: number | null
          pain_areas: string[] | null
          reminder_interval_min: number | null
          reminders_enabled: boolean | null
          sitting_streak_minutes: number | null
          updated_at: string | null
          user_id: string
          uses_standing_desk: boolean | null
        }
        Insert: {
          created_at?: string | null
          desk_hours_per_day?: number | null
          pain_areas?: string[] | null
          reminder_interval_min?: number | null
          reminders_enabled?: boolean | null
          sitting_streak_minutes?: number | null
          updated_at?: string | null
          user_id: string
          uses_standing_desk?: boolean | null
        }
        Update: {
          created_at?: string | null
          desk_hours_per_day?: number | null
          pain_areas?: string[] | null
          reminder_interval_min?: number | null
          reminders_enabled?: boolean | null
          sitting_streak_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          uses_standing_desk?: boolean | null
        }
        Relationships: []
      }
      physio_patient_assignments: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          physio_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          physio_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          physio_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      physio_videos: {
        Row: {
          caption: string | null
          id: string
          patient_user_id: string | null
          physio_user_id: string
          storage_url: string | null
          uploaded_at: string | null
          visibility: string | null
        }
        Insert: {
          caption?: string | null
          id?: string
          patient_user_id?: string | null
          physio_user_id: string
          storage_url?: string | null
          uploaded_at?: string | null
          visibility?: string | null
        }
        Update: {
          caption?: string | null
          id?: string
          patient_user_id?: string | null
          physio_user_id?: string
          storage_url?: string | null
          uploaded_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      posture_samples: {
        Row: {
          alerts: Json
          camera_summary: string
          created_at: string
          head_angle_deg: number
          id: string
          patient_user_id: string
          posture_score: number
          risk_score: number
          shoulder_imbalance_pct: number
          sitting_duration_minutes: number
          source: string
          spine_slouch_angle_deg: number
        }
        Insert: {
          alerts?: Json
          camera_summary?: string
          created_at?: string
          head_angle_deg?: number
          id?: string
          patient_user_id: string
          posture_score?: number
          risk_score?: number
          shoulder_imbalance_pct?: number
          sitting_duration_minutes?: number
          source?: string
          spine_slouch_angle_deg?: number
        }
        Update: {
          alerts?: Json
          camera_summary?: string
          created_at?: string
          head_angle_deg?: number
          id?: string
          patient_user_id?: string
          posture_score?: number
          risk_score?: number
          shoulder_imbalance_pct?: number
          sitting_duration_minutes?: number
          source?: string
          spine_slouch_angle_deg?: number
        }
        Relationships: []
      }
      posture_sessions: {
        Row: {
          avg_neck_flexion: number | null
          avg_shoulder_tilt: number | null
          avg_trunk_flexion: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          metrics: Json | null
          mode: string | null
          overall_score: number | null
          patient_user_id: string
          pct_good_posture: number | null
          posture_mode: string | null
        }
        Insert: {
          avg_neck_flexion?: number | null
          avg_shoulder_tilt?: number | null
          avg_trunk_flexion?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metrics?: Json | null
          mode?: string | null
          overall_score?: number | null
          patient_user_id: string
          pct_good_posture?: number | null
          posture_mode?: string | null
        }
        Update: {
          avg_neck_flexion?: number | null
          avg_shoulder_tilt?: number | null
          avg_trunk_flexion?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metrics?: Json | null
          mode?: string | null
          overall_score?: number | null
          patient_user_id?: string
          pct_good_posture?: number | null
          posture_mode?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          occupation: string | null
          phone: string | null
          sex: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          occupation?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          occupation?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          adherence: number | null
          completed_exercises_count: number | null
          created_at: string | null
          data: Json | null
          ears_answers: Json | null
          ears_score: number | null
          energy_level: number | null
          function_score: number | null
          groc: number | null
          id: string
          notes: string | null
          pain_level: number | null
          patient_user_id: string
          sessions_done: number | null
          sessions_target: number | null
        }
        Insert: {
          adherence?: number | null
          completed_exercises_count?: number | null
          created_at?: string | null
          data?: Json | null
          ears_answers?: Json | null
          ears_score?: number | null
          energy_level?: number | null
          function_score?: number | null
          groc?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          patient_user_id: string
          sessions_done?: number | null
          sessions_target?: number | null
        }
        Update: {
          adherence?: number | null
          completed_exercises_count?: number | null
          created_at?: string | null
          data?: Json | null
          ears_answers?: Json | null
          ears_score?: number | null
          energy_level?: number | null
          function_score?: number | null
          groc?: number | null
          id?: string
          notes?: string | null
          pain_level?: number | null
          patient_user_id?: string
          sessions_done?: number | null
          sessions_target?: number | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          assessment_id: string | null
          confidence: number | null
          created_at: string | null
          id: string
          program: Json | null
          source: string | null
        }
        Insert: {
          assessment_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          program?: Json | null
          source?: string | null
        }
        Update: {
          assessment_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          program?: Json | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      get_booked_slots: {
        Args: { p_date: string; p_physio: string }
        Returns: string[]
      }
      get_platform_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_my_patient: { Args: { _patient_profile_id: string }; Returns: boolean }
      is_my_patient_user: {
        Args: { _patient_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "patient" | "physiotherapist" | "office_worker"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["patient", "physiotherapist", "office_worker"],
    },
  },
} as const
