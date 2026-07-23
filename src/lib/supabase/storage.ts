import { getSupabaseClient } from '@/lib/supabase/client'

export function getStorageClient() {
  return getSupabaseClient().storage
}
