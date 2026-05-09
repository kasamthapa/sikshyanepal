import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
  )
}

// Safe fallback so the module doesn't throw at import time when env vars are missing
const url = supabaseUrl || 'https://placeholder.supabase.co'
const anonKey = supabaseAnonKey || 'placeholder'

export const supabase = createClient(url, anonKey)

// Read-only server client (anon key)
export function createServerSupabaseClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  })
}

// Admin server client — bypasses RLS for write operations
export function createAdminSupabaseClient() {
  const key = supabaseServiceKey || anonKey
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
