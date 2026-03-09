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
      bookmarks: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          downloads_count: number
          file_format: string | null
          file_url: string | null
          id: string
          is_free: boolean
          language: string | null
          preview_pages: number
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          downloads_count?: number
          file_format?: string | null
          file_url?: string | null
          id?: string
          is_free?: boolean
          language?: string | null
          preview_pages?: number
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          downloads_count?: number
          file_format?: string | null
          file_url?: string | null
          id?: string
          is_free?: boolean
          language?: string | null
          preview_pages?: number
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      challenge_entries: {
        Row: {
          challenge_id: string
          content: string
          created_at: string
          id: string
          user_id: string
          votes_count: number
        }
        Insert: {
          challenge_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
          votes_count?: number
        }
        Update: {
          challenge_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "poetry_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string | null
          payment_method: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string | null
          payment_method?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      competition_awards: {
        Row: {
          award_type: string
          awarded_at: string
          competition_id: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          award_type?: string
          awarded_at?: string
          competition_id: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          award_type?: string
          awarded_at?: string
          competition_id?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_awards_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_awards_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "competition_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_entries: {
        Row: {
          competition_id: string
          content: string
          created_at: string
          id: string
          rank: number | null
          title: string
          user_id: string
          votes_count: number
        }
        Insert: {
          competition_id: string
          content: string
          created_at?: string
          id?: string
          rank?: number | null
          title: string
          user_id: string
          votes_count?: number
        }
        Update: {
          competition_id?: string
          content?: string
          created_at?: string
          id?: string
          rank?: number | null
          title?: string
          user_id?: string
          votes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_votes: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_votes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "competition_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          description: string | null
          entry_deadline: string
          id: string
          language: string | null
          max_entries: number | null
          organizer_id: string
          status: Database["public"]["Enums"]["competition_status"]
          theme: string | null
          title: string
          updated_at: string
          voting_deadline: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_deadline: string
          id?: string
          language?: string | null
          max_entries?: number | null
          organizer_id: string
          status?: Database["public"]["Enums"]["competition_status"]
          theme?: string | null
          title: string
          updated_at?: string
          voting_deadline: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_deadline?: string
          id?: string
          language?: string | null
          max_entries?: number | null
          organizer_id?: string
          status?: Database["public"]["Enums"]["competition_status"]
          theme?: string | null
          title?: string
          updated_at?: string
          voting_deadline?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      event_messages: {
        Row: {
          content: string
          created_at: string
          event_id: string
          id: string
          message_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id: string
          id?: string
          message_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mushaira_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mushaira_events"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          amount: number
          coin_cost: number
          created_at: string
          event_id: string | null
          gift_type: string
          id: string
          message: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          amount?: number
          coin_cost?: number
          created_at?: string
          event_id?: string | null
          gift_type: string
          id?: string
          message?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          amount?: number
          coin_cost?: number
          created_at?: string
          event_id?: string | null
          gift_type?: string
          id?: string
          message?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mushaira_events"
            referencedColumns: ["id"]
          },
        ]
      }
      mushaira_events: {
        Row: {
          audience_count: number
          cover_url: string | null
          created_at: string
          description: string | null
          ended_at: string | null
          event_type: Database["public"]["Enums"]["mushaira_type"]
          id: string
          language: string | null
          max_performers: number | null
          organizer_id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["mushaira_status"]
          theme: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience_count?: number
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          event_type?: Database["public"]["Enums"]["mushaira_type"]
          id?: string
          language?: string | null
          max_performers?: number | null
          organizer_id: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["mushaira_status"]
          theme?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience_count?: number
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          event_type?: Database["public"]["Enums"]["mushaira_type"]
          id?: string
          language?: string | null
          max_performers?: number | null
          organizer_id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["mushaira_status"]
          theme?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      poetry_challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          ends_at: string
          id: string
          language: string | null
          starts_at: string
          status: string
          theme: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          ends_at: string
          id?: string
          language?: string | null
          starts_at?: string
          status?: string
          theme?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string
          id?: string
          language?: string | null
          starts_at?: string
          status?: string
          theme?: string | null
          title?: string
        }
        Relationships: []
      }
      poetry_posts: {
        Row: {
          category: string | null
          comments_count: number
          content: string
          created_at: string
          creator_id: string
          gifts_count: number
          id: string
          language: string | null
          likes_count: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          comments_count?: number
          content: string
          created_at?: string
          creator_id: string
          gifts_count?: number
          id?: string
          language?: string | null
          likes_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          creator_id?: string
          gifts_count?: number
          id?: string
          language?: string | null
          likes_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "poetry_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "poetry_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          books_count: number
          country: string | null
          cover_image_url: string | null
          created_at: string
          display_name: string | null
          followers_count: number
          following_count: number
          id: string
          is_creator: boolean
          is_verified: boolean
          language: string | null
          total_gifts_received: number
          updated_at: string
          user_id: string
          videos_count: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          books_count?: number
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          is_creator?: boolean
          is_verified?: boolean
          language?: string | null
          total_gifts_received?: number
          updated_at?: string
          user_id: string
          videos_count?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          books_count?: number
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          is_creator?: boolean
          is_verified?: boolean
          language?: string | null
          total_gifts_received?: number
          updated_at?: string
          user_id?: string
          videos_count?: number
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          invited_email: string | null
          invited_user_id: string | null
          inviter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          invited_email?: string | null
          invited_user_id?: string | null
          inviter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          invited_email?: string | null
          invited_user_id?: string | null
          inviter_id?: string
          status?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          coins: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      video_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string
          description: string | null
          duration_seconds: number | null
          id: string
          language: string | null
          likes_count: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          views_count: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          likes_count?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          views_count?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          likes_count?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          views_count?: number
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
      app_role: "admin" | "moderator" | "user"
      competition_status: "upcoming" | "active" | "voting" | "ended"
      mushaira_status: "upcoming" | "live" | "ended" | "cancelled"
      mushaira_type: "open" | "curated" | "themed" | "international"
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
      app_role: ["admin", "moderator", "user"],
      competition_status: ["upcoming", "active", "voting", "ended"],
      mushaira_status: ["upcoming", "live", "ended", "cancelled"],
      mushaira_type: ["open", "curated", "themed", "international"],
    },
  },
} as const
