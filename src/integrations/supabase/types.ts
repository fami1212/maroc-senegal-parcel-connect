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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      expeditions: {
        Row: {
          client_id: string
          content_type: string
          created_at: string | null
          departure_city: string
          description: string | null
          destination_city: string
          dimensions_cm: string | null
          id: string
          max_budget: number | null
          photos: string[] | null
          preferred_date: string | null
          status: Database["public"]["Enums"]["shipment_status"] | null
          title: string
          transport_type: Database["public"]["Enums"]["transport_type"] | null
          updated_at: string | null
          weight_kg: number
        }
        Insert: {
          client_id: string
          content_type: string
          created_at?: string | null
          departure_city: string
          description?: string | null
          destination_city: string
          dimensions_cm?: string | null
          id?: string
          max_budget?: number | null
          photos?: string[] | null
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          title: string
          transport_type?: Database["public"]["Enums"]["transport_type"] | null
          updated_at?: string | null
          weight_kg: number
        }
        Update: {
          client_id?: string
          content_type?: string
          created_at?: string | null
          departure_city?: string
          description?: string | null
          destination_city?: string
          dimensions_cm?: string | null
          id?: string
          max_budget?: number | null
          photos?: string[] | null
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          title?: string
          transport_type?: Database["public"]["Enums"]["transport_type"] | null
          updated_at?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          reservation_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          reservation_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          reservation_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          is_verified: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          client_id: string
          created_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          expedition_id: string
          id: string
          pickup_address: string | null
          pickup_date: string | null
          status: Database["public"]["Enums"]["shipment_status"] | null
          total_price: number
          tracking_code: string | null
          transporteur_id: string
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          expedition_id: string
          id?: string
          pickup_address?: string | null
          pickup_date?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          total_price: number
          tracking_code?: string | null
          transporteur_id: string
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          expedition_id?: string
          id?: string
          pickup_address?: string | null
          pickup_date?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          total_price?: number
          tracking_code?: string | null
          transporteur_id?: string
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          reservation_id: string
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reservation_id: string
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reservation_id?: string
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          available_volume_m3: number | null
          available_weight_kg: number
          created_at: string | null
          departure_city: string
          departure_date: string
          departure_time: string | null
          destination_city: string
          id: string
          price_per_kg: number
          status: Database["public"]["Enums"]["trip_status"] | null
          transport_type: Database["public"]["Enums"]["transport_type"]
          transporteur_id: string
          updated_at: string | null
          vehicle_info: string | null
        }
        Insert: {
          available_volume_m3?: number | null
          available_weight_kg: number
          created_at?: string | null
          departure_city: string
          departure_date: string
          departure_time?: string | null
          destination_city: string
          id?: string
          price_per_kg: number
          status?: Database["public"]["Enums"]["trip_status"] | null
          transport_type: Database["public"]["Enums"]["transport_type"]
          transporteur_id: string
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Update: {
          available_volume_m3?: number | null
          available_weight_kg?: number
          created_at?: string | null
          departure_city?: string
          departure_date?: string
          departure_time?: string | null
          destination_city?: string
          id?: string
          price_per_kg?: number
          status?: Database["public"]["Enums"]["trip_status"] | null
          transport_type?: Database["public"]["Enums"]["transport_type"]
          transporteur_id?: string
          updated_at?: string | null
          vehicle_info?: string | null
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
      shipment_status:
        | "pending"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
      transport_type: "avion" | "voiture" | "camion" | "bus"
      trip_status: "open" | "full" | "in_progress" | "completed" | "cancelled"
      user_role: "client" | "transporteur"
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
      shipment_status: [
        "pending",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      transport_type: ["avion", "voiture", "camion", "bus"],
      trip_status: ["open", "full", "in_progress", "completed", "cancelled"],
      user_role: ["client", "transporteur"],
    },
  },
} as const
