import { getSupabaseClient } from '@/lib/supabase/client'
import { requireWorkspaceId } from '@/features/workspace/services/workspace-helpers'

export type NotificationItem = {
  id: string
  type: 'project' | 'milestone' | 'content' | 'asset' | 'decision' | 'system'
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
}

export async function listNotifications(
  workspaceIdOrQueryOrUnread?: string | boolean,
  queryOrUnread?: string | boolean,
  unreadOnlyParam = false,
): Promise<NotificationItem[]> {
  let targetWorkspaceId: string
  let queryStr = ''
  let isUnreadOnly = unreadOnlyParam

  if (typeof workspaceIdOrQueryOrUnread === 'boolean') {
    isUnreadOnly = workspaceIdOrQueryOrUnread
    targetWorkspaceId = requireWorkspaceId()
  } else if (typeof queryOrUnread === 'boolean') {
    isUnreadOnly = queryOrUnread
    queryStr = workspaceIdOrQueryOrUnread || ''
    targetWorkspaceId = requireWorkspaceId()
  } else {
    targetWorkspaceId = requireWorkspaceId(workspaceIdOrQueryOrUnread)
    queryStr = queryOrUnread || ''
  }

  const supabase = getSupabaseClient()
  let request = supabase
    .from('notifications')
    .select('id, type, title, body, read_at, created_at')
    .eq('workspace_id', targetWorkspaceId)
    .order('created_at', { ascending: false })

  if (queryStr.trim()) request = request.ilike('title', `%${queryStr.trim()}%`)
  if (isUnreadOnly) request = request.is('read_at', null)
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

export async function markAllNotificationsRead(workspaceId?: string): Promise<void> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('workspace_id', targetWorkspaceId)
    .is('read_at', null)
  if (error) throw error
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw error
}
