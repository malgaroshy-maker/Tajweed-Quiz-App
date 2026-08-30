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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_answers: {
        Row: {
          attempt_id: string
          created_at: string | null
          graded_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          selected_option_id: string | null
          teacher_feedback: string | null
          teacher_score: number | null
          text_answer: string | null
          voice_recording_url: string | null
        }
        Insert: {
          attempt_id: string
          created_at?: string | null
          graded_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          selected_option_id?: string | null
          teacher_feedback?: string | null
          teacher_score?: number | null
          text_answer?: string | null
          voice_recording_url?: string | null
        }
        Update: {
          attempt_id?: string
          created_at?: string | null
          graded_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option_id?: string | null
          teacher_feedback?: string | null
          teacher_score?: number | null
          text_answer?: string | null
          voice_recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "most_missed_questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          completed_at: string | null
          guest_name: string | null
          id: string
          quiz_id: string
          score: number | null
          started_at: string | null
          student_id: string | null
          total_questions: number
        }
        Insert: {
          completed_at?: string | null
          guest_name?: string | null
          id?: string
          quiz_id: string
          score?: number | null
          started_at?: string | null
          student_id?: string | null
          total_questions: number
        }
        Update: {
          completed_at?: string | null
          guest_name?: string | null
          id?: string
          quiz_id?: string
          score?: number | null
          started_at?: string | null
          student_id?: string | null
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      halaqah_members: {
        Row: {
          halaqah_id: string
          id: string
          joined_at: string | null
          student_id: string
        }
        Insert: {
          halaqah_id: string
          id?: string
          joined_at?: string | null
          student_id: string
        }
        Update: {
          halaqah_id?: string
          id?: string
          joined_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "halaqah_members_halaqah_id_fkey"
            columns: ["halaqah_id"]
            isOneToOne: false
            referencedRelation: "halaqat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "halaqah_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      halaqat: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "halaqat_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          code: string
          created_at: string | null
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          used?: boolean | null
        }
        Relationships: []
      }
      options: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "most_missed_questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_provider: string | null
          created_at: string | null
          first_name: string
          gemini_api_key: string | null
          gemini_model: string | null
          id: string
          last_name: string
          openrouter_api_key: string | null
          openrouter_model: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          ai_provider?: string | null
          created_at?: string | null
          first_name: string
          gemini_api_key?: string | null
          gemini_model?: string | null
          id: string
          last_name: string
          openrouter_api_key?: string | null
          openrouter_model?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          ai_provider?: string | null
          created_at?: string | null
          first_name?: string
          gemini_api_key?: string | null
          gemini_model?: string | null
          id?: string
          last_name?: string
          openrouter_api_key?: string | null
          openrouter_model?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          audio_end_time: number | null
          audio_start_time: number | null
          audio_url: string | null
          ayah_number: number | null
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          explanation: string | null
          id: string
          image_url: string | null
          order_index: number | null
          quiz_id: string | null
          reciter_id: string | null
          surah_number: number | null
          tajweed_rule: string | null
          teacher_id: string
          text: string
          topic: string | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          audio_url?: string | null
          ayah_number?: number | null
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          quiz_id?: string | null
          reciter_id?: string | null
          surah_number?: number | null
          tajweed_rule?: string | null
          teacher_id: string
          text: string
          topic?: string | null
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          audio_url?: string | null
          ayah_number?: number | null
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          quiz_id?: string | null
          reciter_id?: string | null
          surah_number?: number | null
          tajweed_rule?: string | null
          teacher_id?: string
          text?: string
          topic?: string | null
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          allow_guest: boolean | null
          created_at: string | null
          description: string | null
          end_date: string | null
          folder_id: string | null
          id: string
          is_published: boolean | null
          share_code: string | null
          show_answers_after_submission: boolean | null
          start_date: string | null
          target_halaqah_id: string | null
          teacher_id: string
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_guest?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          folder_id?: string | null
          id?: string
          is_published?: boolean | null
          share_code?: string | null
          show_answers_after_submission?: boolean | null
          start_date?: string | null
          target_halaqah_id?: string | null
          teacher_id: string
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_guest?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          folder_id?: string | null
          id?: string
          is_published?: boolean | null
          share_code?: string | null
          show_answers_after_submission?: boolean | null
          start_date?: string | null
          target_halaqah_id?: string | null
          teacher_id?: string
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quizzes_target_halaqah"
            columns: ["target_halaqah_id"]
            isOneToOne: false
            referencedRelation: "halaqat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      most_missed_questions: {
        Row: {
          question_id: string | null
          question_text: string | null
          teacher_id: string | null
          wrong_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      question_type:
        | "multiple_choice"
        | "true_false"
        | "short_answer"
        | "fill_in_blank"
        | "tajweed_rule"
      user_role: "teacher" | "student"
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
    Enums: {
      difficulty_level: ["easy", "medium", "hard"],
      question_type: [
        "multiple_choice",
        "true_false",
        "short_answer",
        "fill_in_blank",
        "tajweed_rule",
      ],
      user_role: ["teacher", "student"],
    },
  },
} as const
