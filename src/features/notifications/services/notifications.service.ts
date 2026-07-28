import { getSupabaseClient } from '@/lib/supabase/client'

export type NotificationItem = {
  id: string
  type: 'project' | 'milestone' | 'content' | 'asset' | 'decision' | 'system'
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
}

export async function listNotifications(query = '', unreadOnly = false): Promise<NotificationItem[]> {
  const supabase = getSupabaseClient()
  let request = supabase
    .from('notifications')
    .select('id, type, title, body, read_at, created_at')
    .order('created_at', { ascending: false })
  if (query.trim()) request = request.ilike('title', `%${query.trim()}%`)
  if (unreadOnly) request = request.is('read_at', null)
  const { data, error } = await request
  if (error) throw error
  return (data ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    readAt: item.read_at,
    createdAt: item.created_at,
  }))
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
  if (error) throw error
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw error
}
