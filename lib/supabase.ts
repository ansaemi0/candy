import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Restaurant = {
  id: string
  category: string | null
  recommender: string | null
  location: string | null
  name: string
  genre: string | null
  notes: string | null
  link: string | null
  payco: string | null
  verified: string | null
  verifier: string | null
  review: string | null
  solo_possible: string | null
  created_at: string
}
