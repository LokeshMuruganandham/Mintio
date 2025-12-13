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
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_number: string | null
          balance: number
          bank_name: string
          color: string
          created_at: string
          id: string
          linked_payment_methods: string[] | null
          name: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          balance?: number
          bank_name: string
          color?: string
          created_at?: string
          id?: string
          linked_payment_methods?: string[] | null
          name: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          balance?: number
          bank_name?: string
          color?: string
          created_at?: string
          id?: string
          linked_payment_methods?: string[] | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_brokers: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          label: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      daily_trades: {
        Row: {
          charges: number | null
          created_at: string
          date: string
          demat_account_id: string
          id: string
          notes: string | null
          pnl: number
          user_id: string
        }
        Insert: {
          charges?: number | null
          created_at?: string
          date: string
          demat_account_id: string
          id?: string
          notes?: string | null
          pnl: number
          user_id: string
        }
        Update: {
          charges?: number | null
          created_at?: string
          date?: string
          demat_account_id?: string
          id?: string
          notes?: string | null
          pnl?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_trades_demat_account_id_fkey"
            columns: ["demat_account_id"]
            isOneToOne: false
            referencedRelation: "demat_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      demat_accounts: {
        Row: {
          account_id: string | null
          balance: number
          broker_name: string
          color: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          balance?: number
          broker_name: string
          color?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          balance?: number
          broker_name?: string
          color?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      demat_transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          demat_account_id: string
          id: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          demat_account_id: string
          id?: string
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          demat_account_id?: string
          id?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demat_transactions_demat_account_id_fkey"
            columns: ["demat_account_id"]
            isOneToOne: false
            referencedRelation: "demat_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          account: string
          amount: number
          bank_account_id: string | null
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_split: boolean | null
          payment_method: string
          split_amount: number | null
          split_with: string[] | null
          upi_app: string | null
          user_id: string
        }
        Insert: {
          account: string
          amount: number
          bank_account_id?: string | null
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          is_split?: boolean | null
          payment_method: string
          split_amount?: number | null
          split_with?: string[] | null
          upi_app?: string | null
          user_id: string
        }
        Update: {
          account?: string
          amount?: number
          bank_account_id?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_split?: boolean | null
          payment_method?: string
          split_amount?: number | null
          split_with?: string[] | null
          upi_app?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      split_expenses: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          paid_by: string
          participants: string[]
          split_type: string
          splits: Json
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          paid_by: string
          participants: string[]
          split_type: string
          splits: Json
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          paid_by?: string
          participants?: string[]
          split_type?: string
          splits?: Json
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      startup_investments: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          notes: string | null
          startup_name: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          startup_name: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          startup_name?: string
          user_id?: string
        }
        Relationships: []
      }
      startup_presets: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
