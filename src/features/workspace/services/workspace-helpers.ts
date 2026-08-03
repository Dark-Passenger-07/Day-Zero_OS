import { getCachedActiveWorkspaceId } from './workspace.service'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { WorkspaceRole } from './workspace.service'

export function getCurrentWorkspaceId(): string | null {
  return getCachedActiveWorkspaceId()
}

export function requireWorkspaceId(workspaceId?: string): string {
  const resolved = workspaceId || getCurrentWorkspaceId()
  if (!resolved) {
    throw new Error('Active workspace context is required for this operation.')
  }
  return resolved
}

export async function ensureWorkspaceMembership(workspaceId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return false
  return true
}

export async function ensureWorkspacePermission(
  workspaceId: string,
  userId: string,
  requiredRole: WorkspaceRole,
): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return false

  const rolesPriority: Record<WorkspaceRole, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  }

  const userPriority = rolesPriority[data.role as WorkspaceRole] ?? 0
  const requiredPriority = rolesPriority[requiredRole] ?? 0

  return userPriority >= requiredPriority
}
