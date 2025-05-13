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
      key_results: {
        Row: {
          board_id: number
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          label: string
          objective_id: string
          position_x: number
          position_y: number
          progress: number | null
          style: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          board_id: number
          created_at?: string | null
          department?: string | null
          description?: string | null
          id: string
          label?: string
          objective_id: string
          position_x: number
          position_y: number
          progress?: number | null
          style?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          board_id?: number
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          label?: string
          objective_id?: string
          position_x?: number
          position_y?: number
          progress?: number | null
          style?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "okr_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          board_id: number
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          label: string
          parent_id: string | null
          position_x: number
          position_y: number
          progress: number | null
          style: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          board_id: number
          created_at?: string | null
          department?: string | null
          description?: string | null
          id: string
          label?: string
          parent_id?: string | null
          position_x: number
          position_y: number
          progress?: number | null
          style?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          board_id?: number
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          label?: string
          parent_id?: string | null
          position_x?: number
          position_y?: number
          progress?: number | null
          style?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectives_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "okr_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      okr_boards: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      okr_data: {
        Row: {
          created_at: string | null
          edges: Json
          id: number
          name: string | null
          nodes: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          edges: Json
          id?: number
          name?: string | null
          nodes: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          edges?: Json
          id?: number
          name?: string | null
          nodes?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      okr_edges: {
        Row: {
          animated: boolean | null
          board_id: number
          created_at: string | null
          id: string
          label: string | null
          source_id: string
          style: Json | null
          target_id: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          animated?: boolean | null
          board_id: number
          created_at?: string | null
          id: string
          label?: string | null
          source_id: string
          style?: Json | null
          target_id: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          animated?: boolean | null
          board_id?: number
          created_at?: string | null
          id?: string
          label?: string | null
          source_id?: string
          style?: Json | null
          target_id?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "okr_edges_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "okr_boards"
            referencedColumns: ["id"]
          },
        ]
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
