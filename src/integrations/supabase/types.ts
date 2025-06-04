export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_supply_packs: {
        Row: {
          created_at: string
          grade: string
          id: string
          items: Json
          name: string
          price: number
          school_id: string | null
          school_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          items?: Json
          name: string
          price?: number
          school_id?: string | null
          school_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          items?: Json
          name?: string
          price?: number
          school_id?: string | null
          school_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_supply_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      electronics: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          image: string | null
          in_stock: boolean | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          reviews: number | null
          updated_at: string
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews?: number | null
          updated_at?: string
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          items: Json
          school_name: string | null
          status: string | null
          stripe_session_id: string | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          items?: Json
          school_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          items?: Json
          school_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_blocked: boolean | null
          name: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id: string
          is_blocked?: boolean | null
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_blocked?: boolean | null
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string
          created_at: string
          enrollment: number | null
          grades: string | null
          id: string
          is_active: boolean
          name: string
          phone: string
          principal: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          enrollment?: number | null
          grades?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone: string
          principal?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          enrollment?: number | null
          grades?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          principal?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      supply_packs: {
        Row: {
          created_at: string
          description: string | null
          grade: string
          id: string
          items: Json
          name: string
          price: number
          school_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade: string
          id?: string
          items?: Json
          name: string
          price: number
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: string
          id?: string
          items?: Json
          name?: string
          price?: number
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_packs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_profile: {
        Args: { user_id_to_delete: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_block_status: {
        Args: { user_id_to_update: string; is_blocked: boolean }
        Returns: boolean
      }
      update_user_profile: {
        Args: {
          user_id_to_update: string
          user_name: string
          user_phone: string
          user_address: string
          user_role: string
        }
        Returns: boolean
      }
      update_user_role: {
        Args: { user_id_to_update: string; new_role: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
