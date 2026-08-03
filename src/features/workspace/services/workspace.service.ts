import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled } from '@/lib/supabase/mockClient'

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type WorkspaceMemberStatus = 'pending' | 'active' | 'suspended' | 'removed'
export type WorkspaceInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'

export type Workspace = {
  id: string
  ownerId: string
  name: string
  slug: string
  isPersonal: boolean
  logoUrl: string | null
  storagePath: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type WorkspaceMember = {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  status: WorkspaceMemberStatus
  joinedAt: string
  profile?: {
    fullName: string | null
    username: string | null
    avatarUrl: string | null
  }
}

export type WorkspaceInvitation = {
  id: string
  workspaceId: string
  email: string
  role: WorkspaceRole
  invitedBy: string
  status: WorkspaceInvitationStatus
  expiresAt: string
  createdAt: string
}

const LOCAL_STORAGE_ACTIVE_WS_KEY = 'day_zero_os_active_workspace_id'

export function getCachedActiveWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCAL_STORAGE_ACTIVE_WS_KEY)
}

export function setCachedActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_WS_KEY, workspaceId)
}

export async function listUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace:workspaces(*)')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) throw error

  return (data ?? [])
    .map((item: any) => item.workspace)
    .filter((ws: any) => ws && !ws.deleted_at)
    .map((ws: any) => ({
      id: ws.id,
      ownerId: ws.owner_id,
      name: ws.name,
      slug: ws.slug,
      isPersonal: Boolean(ws.is_personal),
      logoUrl: ws.logo_url ?? null,
      storagePath: ws.storage_path ?? null,
      metadata: ws.metadata ?? {},
      createdAt: ws.created_at,
      updatedAt: ws.updated_at,
    }))
}

export async function resolveCurrentWorkspaceId(userId: string): Promise<string> {
  const userWorkspaces = await listUserWorkspaces(userId)
  if (userWorkspaces.length === 0) {
    throw new Error('No active workspace found for user.')
  }

  // 1. Priority: URL parameter
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const urlWsId = urlParams.get('ws')
    if (urlWsId && userWorkspaces.some((w) => w.id === urlWsId)) {
      setCachedActiveWorkspaceId(urlWsId)
      return urlWsId
    }
  }

  // 2. Priority: localStorage cache
  const cachedId = getCachedActiveWorkspaceId()
  if (cachedId && userWorkspaces.some((w) => w.id === cachedId)) {
    return cachedId
  }

  // 3. Priority: user_settings.current_workspace_id
  const supabase = getSupabaseClient()
  const { data: setts } = await supabase
    .from('user_settings')
    .select('current_workspace_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (setts?.current_workspace_id && userWorkspaces.some((w) => w.id === setts.current_workspace_id)) {
    setCachedActiveWorkspaceId(setts.current_workspace_id)
    return setts.current_workspace_id
  }

  // 4. Priority: Personal Workspace Fallback
  const personalWs = userWorkspaces.find((w) => w.isPersonal) ?? userWorkspaces[0]
  setCachedActiveWorkspaceId(personalWs.id)
  return personalWs.id
}

export async function setCurrentWorkspace(userId: string, workspaceId: string): Promise<void> {
  setCachedActiveWorkspaceId(workspaceId)

  if (isDemoModeEnabled()) return

  const supabase = getSupabaseClient()
  await supabase
    .from('user_settings')
    .update({ current_workspace_id: workspaceId })
    .eq('user_id', userId)
}

export async function createWorkspace(userId: string, name: string): Promise<Workspace> {
  const supabase = getSupabaseClient()
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace'
  const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .insert({
      owner_id: userId,
      name,
      slug,
      is_personal: false,
    })
    .select()
    .single()

  if (wsError) throw wsError

  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: ws.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
  })

  if (memberError) throw memberError

  await setCurrentWorkspace(userId, ws.id)

  return {
    id: ws.id,
    ownerId: ws.owner_id,
    name: ws.name,
    slug: ws.slug,
    isPersonal: Boolean(ws.is_personal),
    logoUrl: ws.logo_url ?? null,
    storagePath: ws.storage_path ?? null,
    metadata: ws.metadata ?? {},
    createdAt: ws.created_at,
    updatedAt: ws.updated_at,
  }
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, status, joined_at, profile:profiles(full_name, username, avatar_url)')
    .eq('workspace_id', workspaceId)
    .neq('status', 'removed')

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    workspaceId: item.workspace_id,
    userId: item.user_id,
    role: item.role,
    status: item.status,
    joinedAt: item.joined_at,
    profile: item.profile
      ? {
          fullName: item.profile.full_name ?? null,
          username: item.profile.username ?? null,
          avatarUrl: item.profile.avatar_url ?? null,
        }
      : undefined,
  }))
}

export async function getWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select('id, workspace_id, email, role, invited_by, status, expires_at, created_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    workspaceId: item.workspace_id,
    email: item.email,
    role: item.role,
    invitedBy: item.invited_by,
    status: item.status,
    expiresAt: item.expires_at,
    createdAt: item.created_at,
  }))
}

export async function inviteWorkspaceMember(
  workspaceId: string,
  invitedByUserId: string,
  email: string,
  role: 'admin' | 'editor' | 'viewer' = 'editor',
): Promise<void> {
  const supabase = getSupabaseClient()

  const rawToken = crypto.randomUUID() + '-' + crypto.randomUUID()
  const encoder = new TextEncoder()
  const data = encoder.encode(rawToken)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase.from('workspace_invitations').insert({
    workspace_id: workspaceId,
    email,
    role,
    invited_by: invitedByUserId,
    token_hash: tokenHash,
    status: 'pending',
  })

  if (error) throw error
}

export async function revokeWorkspaceInvitation(workspaceId: string, invitationId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspace_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId)
    .eq('workspace_id', workspaceId)

  if (error) throw error
}

export async function transferWorkspaceOwnership(
  workspaceId: string,
  _currentOwnerId: string,
  newOwnerId: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.rpc('transfer_workspace_ownership', {
    target_workspace_id: workspaceId,
    new_owner_id: newOwnerId,
  })

  if (error) throw error
}

export async function removeWorkspaceMember(workspaceId: string, memberUserId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'removed' })
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberUserId)

  if (error) throw error
}

export async function updateWorkspaceMemberRole(
  workspaceId: string,
  memberUserId: string,
  newRole: 'admin' | 'editor' | 'viewer',
): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberUserId)

  if (error) throw error
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspaces')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', workspaceId)

  if (error) throw error
}

export async function leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspace_members')
    .update({ status: 'removed' })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function updateWorkspaceDetails(
  workspaceId: string,
  updates: { name?: string; logoUrl?: string | null; description?: string },
): Promise<void> {
  const supabase = getSupabaseClient()
  const payload: any = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl
  if (updates.description !== undefined) {
    const { data: ws } = await supabase
      .from('workspaces')
      .select('metadata')
      .eq('id', workspaceId)
      .single()
    const metadata = ws?.metadata ?? {}
    payload.metadata = { ...metadata, description: updates.description }
  }

  const { error } = await supabase
    .from('workspaces')
    .update(payload)
    .eq('id', workspaceId)

  if (error) throw error
}

export * from './workspace-invitation.service'

