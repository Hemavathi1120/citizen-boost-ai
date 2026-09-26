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
      applications: {
        Row: {
          ai_prepared_summary: string | null
          created_at: string
          form_data: Json | null
          id: string
          notes: string | null
          progress: number
          scheme_id: string
          status: Database["public"]["Enums"]["app_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prepared_summary?: string | null
          created_at?: string
          form_data?: Json | null
          id?: string
          notes?: string | null
          progress?: number
          scheme_id: string
          status?: Database["public"]["Enums"]["app_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prepared_summary?: string | null
          created_at?: string
          form_data?: Json | null
          id?: string
          notes?: string | null
          progress?: number
          scheme_id?: string
          status?: Database["public"]["Enums"]["app_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_confidence: number | null
          created_at: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          extracted_data: Json | null
          file_path: string
          id: string
          mime_type: string | null
          name: string
          ocr_text: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          extracted_data?: Json | null
          file_path: string
          id?: string
          mime_type?: string | null
          name: string
          ocr_text?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          extracted_data?: Json | null
          file_path?: string
          id?: string
          mime_type?: string | null
          name?: string
          ocr_text?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          annual_income: number | null
          created_at: string
          date_of_birth: string | null
          gender: string | null
          id: string
          name: string
          occupation: string | null
          relation: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_income?: number | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          name: string
          occupation?: string | null
          relation: string
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_income?: number | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          name?: string
          occupation?: string | null
          relation?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aadhaar_last4: string | null
          annual_income: number | null
          avatar_url: string | null
          category: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          disability_status: boolean | null
          education: string | null
          eligibility_score: number | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          marital_status: string | null
          occupation: string | null
          onboarding_complete: boolean
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          aadhaar_last4?: string | null
          annual_income?: number | null
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_status?: boolean | null
          education?: string | null
          eligibility_score?: number | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          marital_status?: string | null
          occupation?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          aadhaar_last4?: string | null
          annual_income?: number | null
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_status?: boolean | null
          education?: string | null
          eligibility_score?: number | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          marital_status?: string | null
          occupation?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_schemes: {
        Row: {
          created_at: string
          id: string
          scheme_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scheme_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scheme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_schemes_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          application_url: string | null
          benefits: string | null
          category: string
          created_at: string
          description: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["scheme_level"]
          ministry: string | null
          name: string
          required_documents: string[] | null
          short_description: string | null
          slug: string
          state: string | null
          tags: string[] | null
        }
        Insert: {
          application_url?: string | null
          benefits?: string | null
          category: string
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["scheme_level"]
          ministry?: string | null
          name: string
          required_documents?: string[] | null
          short_description?: string | null
          slug: string
          state?: string | null
          tags?: string[] | null
        }
        Update: {
          application_url?: string | null
          benefits?: string | null
          category?: string
          created_at?: string
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["scheme_level"]
          ministry?: string | null
          name?: string
          required_documents?: string[] | null
          short_description?: string | null
          slug?: string
          state?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "citizen"
      app_status:
        | "draft"
        | "prepared"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
      doc_status: "pending" | "processing" | "verified" | "failed"
      doc_type:
        | "aadhaar"
        | "pan"
        | "income_certificate"
        | "caste_certificate"
        | "ration_card"
        | "domicile"
        | "bank_passbook"
        | "disability_certificate"
        | "birth_certificate"
        | "marksheet"
        | "photo"
        | "other"
      scheme_level: "central" | "state"
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
      app_role: ["admin", "citizen"],
      app_status: [
        "draft",
        "prepared",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
      doc_status: ["pending", "processing", "verified", "failed"],
      doc_type: [
        "aadhaar",
        "pan",
        "income_certificate",
        "caste_certificate",
        "ration_card",
        "domicile",
        "bank_passbook",
        "disability_certificate",
        "birth_certificate",
        "marksheet",
        "photo",
        "other",
      ],
      scheme_level: ["central", "state"],
    },
  },
} as const
