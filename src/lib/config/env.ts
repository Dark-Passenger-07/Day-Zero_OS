type PublicEnv = {
  appEnv: string
  appUrl: string
  supabaseUrl?: string
  supabaseAnonKey?: string
}

const rawEnv = import.meta.env

export const env: PublicEnv = {
  appEnv: rawEnv.VITE_APP_ENV ?? rawEnv.MODE ?? 'development',
  appUrl: rawEnv.VITE_APP_URL ?? 'http://localhost:8443',
  supabaseUrl: rawEnv.VITE_SUPABASE_URL,
  supabaseAnonKey: rawEnv.VITE_SUPABASE_ANON_KEY,
}

export function validatePublicEnv() {
  const missing: string[] = []

  if (!env.supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!env.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')

  return {
    isSupabaseConfigured: missing.length === 0,
    missing,
  }
}
