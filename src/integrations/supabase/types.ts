export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      certifications: {
        Row: {
          course_id: string
          enrollment_id: string
          fecha_emision: string
          id: string
          marcado_como_enviado: boolean
          numero_certificado: string
          url_certificado: string | null
          user_id: string
          verificado: boolean
        }
        Insert: {
          course_id: string
          enrollment_id: string
          fecha_emision?: string
          id?: string
          marcado_como_enviado?: boolean
          numero_certificado: string
          url_certificado?: string | null
          user_id: string
          verificado?: boolean
        }
        Update: {
          course_id?: string
          enrollment_id?: string
          fecha_emision?: string
          id?: string
          marcado_como_enviado?: boolean
          numero_certificado?: string
          url_certificado?: string | null
          user_id?: string
          verificado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "certifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_form_submissions: {
        Row: {
          answers: Json
          course_id: string
          form_id: string
          id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          course_id: string
          form_id: string
          id?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          course_id?: string
          form_id?: string
          id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_form_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "course_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      course_forms: {
        Row: {
          active: boolean | null
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          questions: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          questions?: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          questions?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_forms_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          activo: boolean
          course_id: string
          created_at: string
          descripcion: string | null
          id: string
          orden: number
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          course_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          orden?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          course_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          orden?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_course_modules_course_id"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_slides: {
        Row: {
          activo: boolean
          contenido: string | null
          created_at: string
          cuestionario_data: Json | null
          duracion_estimada: number | null
          id: string
          imagen_url: string
          module_id: string
          orden: number
          puntuacion_minima: number | null
          tipo_contenido: Database["public"]["Enums"]["content_type"] | null
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          activo?: boolean
          contenido?: string | null
          created_at?: string
          cuestionario_data?: Json | null
          duracion_estimada?: number | null
          id?: string
          imagen_url: string
          module_id: string
          orden?: number
          puntuacion_minima?: number | null
          tipo_contenido?: Database["public"]["Enums"]["content_type"] | null
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          activo?: boolean
          contenido?: string | null
          created_at?: string
          cuestionario_data?: Json | null
          duracion_estimada?: number | null
          id?: string
          imagen_url?: string
          module_id?: string
          orden?: number
          puntuacion_minima?: number | null
          tipo_contenido?: Database["public"]["Enums"]["content_type"] | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_course_slides_module_id"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          duracion_horas: number
          id: string
          imagen_url: string | null
          instructor_id: string | null
          is_free: boolean | null
          learning_objectives: Json | null
          nivel: string
          precio: number
          requires_form: boolean | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          duracion_horas?: number
          id?: string
          imagen_url?: string | null
          instructor_id?: string | null
          is_free?: boolean | null
          learning_objectives?: Json | null
          nivel: string
          precio?: number
          requires_form?: boolean | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          duracion_horas?: number
          id?: string
          imagen_url?: string | null
          instructor_id?: string | null
          is_free?: boolean | null
          learning_objectives?: Json | null
          nivel?: string
          precio?: number
          requires_form?: boolean | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completado: boolean
          course_id: string
          fecha_completado: string | null
          fecha_inscripcion: string
          id: string
          progreso: number
          user_id: string
        }
        Insert: {
          completado?: boolean
          course_id: string
          fecha_completado?: string | null
          fecha_inscripcion?: string
          id?: string
          progreso?: number
          user_id: string
        }
        Update: {
          completado?: boolean
          course_id?: string
          fecha_completado?: string | null
          fecha_inscripcion?: string
          id?: string
          progreso?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apellido: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          fecha_nacimiento: string | null
          id: string
          institution_id: string | null
          nombre: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apellido?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          fecha_nacimiento?: string | null
          id?: string
          institution_id?: string | null
          nombre?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apellido?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          fecha_nacimiento?: string | null
          id?: string
          institution_id?: string | null
          nombre?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      slide_attempts: {
        Row: {
          created_at: string
          enrollment_id: string
          es_correcta: boolean
          id: string
          puntuacion: number
          respuesta_seleccionada: string
          slide_id: string
          tiempo_respuesta: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          es_correcta: boolean
          id?: string
          puntuacion?: number
          respuesta_seleccionada: string
          slide_id: string
          tiempo_respuesta?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          es_correcta?: boolean
          id?: string
          puntuacion?: number
          respuesta_seleccionada?: string
          slide_id?: string
          tiempo_respuesta?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_ai_usage: {
        Row: {
          created_at: string | null
          id: string
          month_year: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          month_year: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          month_year?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completado: boolean
          created_at: string
          enrollment_id: string
          id: string
          slide_id: string
          tiempo_completado: string | null
          tiempo_inicio: string | null
          tiempo_total_segundos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completado?: boolean
          created_at?: string
          enrollment_id: string
          id?: string
          slide_id: string
          tiempo_completado?: string | null
          tiempo_inicio?: string | null
          tiempo_total_segundos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completado?: boolean
          created_at?: string
          enrollment_id?: string
          id?: string
          slide_id?: string
          tiempo_completado?: string | null
          tiempo_inicio?: string | null
          tiempo_total_segundos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_progress_enrollment_id"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_progress_slide_id"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "course_slides"
            referencedColumns: ["id"]
          },
        ]
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_ai_usage: {
        Args: { p_month_year: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "estudiante" | "user"
      content_type: "imagen" | "cuestionario" | "video"
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
      app_role: ["admin", "instructor", "estudiante", "user"],
      content_type: ["imagen", "cuestionario", "video"],
    },
  },
} as const
