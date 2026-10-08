import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null | undefined

/**
 * One shared client for data and auth, or `null` when Supabase isn't configured
 * (the app then runs on mock data with accounts disabled).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  cached = url && anonKey ? createClient(url, anonKey) : null
  return cached
}
