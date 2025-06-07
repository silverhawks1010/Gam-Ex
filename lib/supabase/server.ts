import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          username: string
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          username: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          username?: string
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
} 