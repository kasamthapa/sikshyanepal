import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Read-only server client (anon key)
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
}

// Admin server client — bypasses RLS for write operations
export function createAdminSupabaseClient() {
  const key = supabaseServiceKey || supabaseAnonKey
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  })
}
