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
      content_reports: {
        Row: {
          admin_notes: string | null
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      creator_wallets: {
        Row: {
          ad_earnings: number
          available_balance: number
          book_earnings: number
          created_at: string
          fan_club_earnings: number
          gift_earnings: number
          id: string
          total_earnings: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_earnings?: number
          available_balance?: number
          book_earnings?: number
          created_at?: string
          fan_club_earnings?: number
          gift_earnings?: number
          id?: string
          total_earnings?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_earnings?: number
          available_balance?: number
          book_earnings?: number
          created_at?: string
          fan_club_earnings?: number
          gift_earnings?: number
          id?: string
          total_earnings?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
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
      fan_club_posts: {
        Row: {
          content: string
          created_at: string
          creator_id: string
          fan_club_id: string
          id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          creator_id: string
          fan_club_id: string
          id?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          creator_id?: string
          fan_club_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_club_posts_fan_club_id_fkey"
            columns: ["fan_club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_club_subscriptions: {
        Row: {
          expires_at: string
          fan_club_id: string
          id: string
          status: string
          subscribed_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          fan_club_id: string
          id?: string
          status?: string
          subscribed_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          fan_club_id?: string
          id?: string
          status?: string
          subscribed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_club_subscriptions_fan_club_id_fkey"
            columns: ["fan_club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_clubs: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_active: boolean
          member_count: number
          name: string
          price_monthly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          name: string
          price_monthly?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          name?: string
          price_monthly?: number
          updated_at?: string
        }
        Relationships: []
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
          engagement_score: number
          gifts_count: number
          id: string
          impressions_count: number
          is_editor_pick: boolean
          language: string | null
          likes_count: number
          shares_count: number
          title: string
          total_reading_time: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          comments_count?: number
          content: string
          created_at?: string
          creator_id: string
          engagement_score?: number
          gifts_count?: number
          id?: string
          impressions_count?: number
          is_editor_pick?: boolean
          language?: string | null
          likes_count?: number
          shares_count?: number
          title: string
          total_reading_time?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          creator_id?: string
          engagement_score?: number
          gifts_count?: number
          id?: string
          impressions_count?: number
          is_editor_pick?: boolean
          language?: string | null
          likes_count?: number
          shares_count?: number
          title?: string
          total_reading_time?: number
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
      post_impressions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reading_time_seconds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reading_time_seconds?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reading_time_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_impressions_post_id_fkey"
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
      post_shares: {
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
            foreignKeyName: "post_shares_post_id_fkey"
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
          cnic: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          followers_count: number
          following_count: number
          id: string
          is_banned: boolean
          is_creator: boolean
          is_suspended: boolean
          is_verified: boolean
          language: string | null
          preferred_genres: string[] | null
          preferred_languages: string[] | null
          promotion_coins_spent: number
          promotion_obligation_met: boolean
          strike_count: number
          suspended_until: string | null
          total_gifts_received: number
          updated_at: string
          user_id: string
          videos_count: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          books_count?: number
          cnic?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          is_banned?: boolean
          is_creator?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          language?: string | null
          preferred_genres?: string[] | null
          preferred_languages?: string[] | null
          promotion_coins_spent?: number
          promotion_obligation_met?: boolean
          strike_count?: number
          suspended_until?: string | null
          total_gifts_received?: number
          updated_at?: string
          user_id: string
          videos_count?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          books_count?: number
          cnic?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          is_banned?: boolean
          is_creator?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          language?: string | null
          preferred_genres?: string[] | null
          preferred_languages?: string[] | null
          promotion_coins_spent?: number
          promotion_obligation_met?: boolean
          strike_count?: number
          suspended_until?: string | null
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
      room_queue: {
        Row: {
          id: string
          position: number
          requested_at: string
          room_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          position?: number
          requested_at?: string
          room_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          position?: number
          requested_at?: string
          room_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_queue_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "video_mushaira_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_seats: {
        Row: {
          id: string
          is_muted: boolean
          joined_at: string
          room_id: string
          score: number
          seat_number: number
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          room_id: string
          score?: number
          seat_number: number
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          room_id?: string
          score?: number
          seat_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_seats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "video_mushaira_rooms"
            referencedColumns: ["id"]
          },
        ]
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
      user_violations: {
        Row: {
          action_taken: string
          ai_reason: string | null
          content_text: string | null
          content_type: string
          created_at: string
          id: string
          strike_number: number
          user_id: string
          violation_type: string
        }
        Insert: {
          action_taken?: string
          ai_reason?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string
          id?: string
          strike_number?: number
          user_id: string
          violation_type?: string
        }
        Update: {
          action_taken?: string
          ai_reason?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string
          id?: string
          strike_number?: number
          user_id?: string
          violation_type?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          full_name: string
          id: string
          portfolio_links: string | null
          reason: string
          reviewed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          full_name: string
          id?: string
          portfolio_links?: string | null
          reason: string
          reviewed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          full_name?: string
          id?: string
          portfolio_links?: string | null
          reason?: string
          reviewed_at?: string | null
          status?: string
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
      video_mushaira_rooms: {
        Row: {
          audience_count: number
          competition_mode: boolean
          created_at: string
          description: string | null
          ended_at: string | null
          host_id: string
          id: string
          max_seats: number
          status: string
          title: string
        }
        Insert: {
          audience_count?: number
          competition_mode?: boolean
          created_at?: string
          description?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          max_seats?: number
          status?: string
          title: string
        }
        Update: {
          audience_count?: number
          competition_mode?: boolean
          created_at?: string
          description?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          max_seats?: number
          status?: string
          title?: string
        }
        Relationships: []
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      watch_time_tracking: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          creator_id: string
          id: string
          viewer_id: string
          watch_seconds: number
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          creator_id: string
          id?: string
          viewer_id: string
          watch_seconds?: number
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          creator_id?: string
          id?: string
          viewer_id?: string
          watch_seconds?: number
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          status?: string
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
      recalculate_engagement_score: {
        Args: { p_post_id: string }
        Returns: undefined
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
