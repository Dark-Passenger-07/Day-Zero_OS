import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { validatePublicEnv, env } from '@/lib/config/env'
import { AppError } from '@/lib/errors/AppError'
import { isDemoModeEnabled, mockSupabase } from './mockClient'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (isDemoModeEnabled()) {
    return mockSupabase as unknown as SupabaseClient
  }

  const validation = validatePublicEnv()

  if (!validation.isSupabaseConfigured || !env.supabaseUrl || !env.supabaseAnonKey) {
    throw new AppError(
      'SUPABASE_NOT_CONFIGURED',
      `Missing Supabase environment variables: ${validation.missing.join(', ')}`,
    )
  }

  client ??= createClient(env.supabaseUrl, env.supabaseAnonKey)
  return client
}

export function isSupabaseConfigured() {
  return isDemoModeEnabled() || validatePublicEnv().isSupabaseConfigured
}
