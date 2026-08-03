import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled, getStoredData, saveStoredData, generateMockJoinCode } from '@/lib/supabase/mockClient'
import { renderInvitationEmail } from '@/lib/email/templates/invitation-template'
import { emailQueueService } from '@/lib/email/email-queue.service'

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
  joinCode: string
  defaultJoinRole: 'editor' | 'viewer'
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
    email: string | null
    teamTitle: string | null
    aboutBio: string | null
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
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const workspaces = db['workspaces'] || []

    const userMembers = members.filter((m: any) => m.user_id === userId && m.status === 'active')
    const list: Workspace[] = []

    for (const m of userMembers) {
      const ws = workspaces.find((w: any) => w.id === m.workspace_id)
      if (ws && !ws.deleted_at) {
        list.push({
          id: ws.id,
          ownerId: ws.owner_id,
          name: ws.name,
          slug: ws.slug,
          isPersonal: Boolean(ws.is_personal),
          logoUrl: ws.logo_url ?? null,
          storagePath: ws.storage_path ?? null,
          joinCode: ws.join_code ?? '',
          defaultJoinRole: (ws.default_join_role as 'editor' | 'viewer') ?? 'editor',
          metadata: ws.metadata ?? {},
          createdAt: ws.created_at,
          updatedAt: ws.updated_at,
        })
      }
    }
    return list
  }

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
      joinCode: ws.join_code ?? '',
      defaultJoinRole: (ws.default_join_role as 'editor' | 'viewer') ?? 'editor',
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

  if (isDemoModeEnabled()) {
    const personalWs = userWorkspaces.find((w) => w.isPersonal) ?? userWorkspaces[0]
    setCachedActiveWorkspaceId(personalWs.id)
    return personalWs.id
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
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace'
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`
    const wsId = crypto.randomUUID()
    const joinCode = generateMockJoinCode()

    const newWs = {
      id: wsId,
      owner_id: userId,
      name,
      slug,
      is_personal: false,
      join_code: joinCode,
      default_join_role: 'editor',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    db['workspaces'] = db['workspaces'] || []
    db['workspaces'].push(newWs)

    db['workspace_members'] = db['workspace_members'] || []
    db['workspace_members'].push({
      id: crypto.randomUUID(),
      workspace_id: wsId,
      user_id: userId,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    })

    saveStoredData(db)
    setCachedActiveWorkspaceId(wsId)

    return {
      id: newWs.id,
      ownerId: newWs.owner_id,
      name: newWs.name,
      slug: newWs.slug,
      isPersonal: false,
      logoUrl: null,
      storagePath: null,
      joinCode,
      defaultJoinRole: 'editor',
      metadata: {},
      createdAt: newWs.created_at,
      updatedAt: newWs.updated_at,
    }
  }

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
    joinCode: ws.join_code ?? '',
    defaultJoinRole: (ws.default_join_role as 'editor' | 'viewer') ?? 'editor',
    metadata: ws.metadata ?? {},
    createdAt: ws.created_at,
    updatedAt: ws.updated_at,
  }
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const profiles = db['profiles'] || []

    const wsMembers = members.filter((m: any) => m.workspace_id === workspaceId && m.status !== 'removed')
    return wsMembers.map((item: any) => {
      const prof = profiles.find((p: any) => p.id === item.user_id)
      return {
        id: item.id,
        workspaceId: item.workspace_id,
        userId: item.user_id,
        role: item.role,
        status: item.status,
        joinedAt: item.joined_at,
        profile: prof
          ? {
              fullName: prof.full_name ?? null,
              username: prof.username ?? null,
              avatarUrl: prof.avatar_url ?? null,
              email: prof.email ?? null,
              teamTitle: prof.team_title ?? null,
              aboutBio: prof.about_bio ?? null,
            }
          : undefined,
      }
    })
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, status, joined_at, profile:profiles(full_name, username, avatar_url, email, team_title, about_bio)')
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
          email: item.profile.email ?? null,
          teamTitle: item.profile.team_title ?? null,
          aboutBio: item.profile.about_bio ?? null,
        }
      : undefined,
  }))
}

export async function getWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const invitations = db['workspace_invitations'] || []
    const wsInvs = invitations.filter((i: any) => i.workspace_id === workspaceId && i.status === 'pending')
    return wsInvs.map((item: any) => ({
      id: item.id,
      workspaceId: item.workspace_id,
      email: item.email,
      role: item.role,
      invitedBy: item.invited_by,
      status: item.status,
      expiresAt: item.expires_at,
      createdAt: item.created_at || new Date().toISOString(),
    }))
  }

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
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) throw new Error('Email address is required.')

  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (!ws) throw new Error('Workspace not found')

    const members = db['workspace_members'] || []
    const existingMember = members.find((m: any) => m.workspace_id === workspaceId && m.user_id === cleanEmail)
    if (existingMember && existingMember.status === 'active') {
      throw new Error('This user is already an active member of this workspace.')
    }

    const invitations = db['workspace_invitations'] || []
    invitations.push({
      id: `inv-${crypto.randomUUID()}`,
      workspace_id: workspaceId,
      email: cleanEmail,
      role,
      invited_by: invitedByUserId,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    })
    saveStoredData(db)

    const inviterProfile = (db['profiles'] || []).find((p: any) => p.id === invitedByUserId)
    const inviterName = inviterProfile?.full_name || 'A team member'

    const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
    const emailPayload = renderInvitationEmail({
      workspaceName: ws.name,
      workspaceLogo: ws.logo_url,
      inviterName,
      role,
      joinCode: ws.join_code || 'WSCODE',
      appUrl,
    })

    await emailQueueService.enqueue({
      to: cleanEmail,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
      replyTo: 'dayzeromedia.co@gmail.com',
    })

    return
  }

  const supabase = getSupabaseClient()

  // 1. Check if user is already an active member
  const { data: memberProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', cleanEmail.split('@')[0])

  if (memberProfiles && memberProfiles.length > 0) {
    const userIds = memberProfiles.map((p: any) => p.id)
    const { data: activeMembers } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .in('user_id', userIds)

    if (activeMembers && activeMembers.length > 0) {
      throw new Error('This user is already an active member of this workspace.')
    }
  }

  // 2. Fetch workspace details
  const { data: ws, error: wsErr } = await supabase
    .from('workspaces')
    .select('name, logo_url, join_code')
    .eq('id', workspaceId)
    .single()

  if (wsErr || !ws) throw new Error('Workspace not found.')

  // 3. Fetch inviter profile name
  const { data: inviter } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', invitedByUserId)
    .single()

  const inviterName = inviter?.full_name || 'A team member'

  // 4. Generate random token hash for DB audit compatibility
  const rawToken = crypto.randomUUID()
  const encoder = new TextEncoder()
  const data = encoder.encode(rawToken)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  // 5. Insert audit record in workspace_invitations
  const { error: inviteErr } = await supabase
    .from('workspace_invitations')
    .insert({
      workspace_id: workspaceId,
      email: cleanEmail,
      role,
      invited_by: invitedByUserId,
      token_hash: tokenHash,
      secret_hash: tokenHash,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

  if (inviteErr) throw inviteErr

  // 6. Send Invitation Email containing the join code
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
  const emailPayload = renderInvitationEmail({
    workspaceName: ws.name,
    workspaceLogo: ws.logo_url,
    inviterName,
    role,
    joinCode: ws.join_code,
    appUrl,
  })

  await emailQueueService.enqueue({
    to: cleanEmail,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
    replyTo: 'dayzeromedia.co@gmail.com',
  })
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
  currentOwnerId: string,
  newOwnerId: string,
): Promise<void> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const oldOwner = members.find((m: any) => m.workspace_id === workspaceId && m.user_id === currentOwnerId)
    const newOwner = members.find((m: any) => m.workspace_id === workspaceId && m.user_id === newOwnerId)
    if (newOwner) newOwner.role = 'owner'
    if (oldOwner) oldOwner.role = 'admin'

    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (ws) ws.owner_id = newOwnerId

    saveStoredData(db)
    return
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase.rpc('transfer_workspace_ownership', {
    target_workspace_id: workspaceId,
    new_owner_id: newOwnerId,
  })

  if (error) throw error
}

export async function removeWorkspaceMember(workspaceId: string, memberUserId: string): Promise<void> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const member = members.find((m: any) => m.workspace_id === workspaceId && m.user_id === memberUserId)
    if (member) {
      member.status = 'removed'
      saveStoredData(db)
    }
    return
  }

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
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const member = members.find((m: any) => m.workspace_id === workspaceId && m.user_id === memberUserId)
    if (member) {
      member.role = newRole
      saveStoredData(db)
    }
    return
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspace_members')
    .update({ role: newRole })
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberUserId)

  if (error) throw error
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (ws) {
      ws.deleted_at = new Date().toISOString()
      saveStoredData(db)
    }
    return
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspaces')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', workspaceId)

  if (error) throw error
}

export async function leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const members = db['workspace_members'] || []
    const member = members.find((m: any) => m.workspace_id === workspaceId && m.user_id === userId)
    if (member) {
      member.status = 'removed'
      saveStoredData(db)
    }
    return
  }

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
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (ws) {
      if (updates.name !== undefined) ws.name = updates.name
      if (updates.logoUrl !== undefined) ws.logo_url = updates.logoUrl
      if (updates.description !== undefined) {
        ws.metadata = { ...(ws.metadata || {}), description: updates.description }
      }
      saveStoredData(db)
    }
    return
  }

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

export async function joinWorkspaceByCode(code: string, userId: string): Promise<string> {
  const cleanCode = code.replace(/-/, '').trim().toUpperCase()
  if (cleanCode.length !== 8) {
    throw new Error('Join code must be exactly 8 alphanumeric characters.')
  }

  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const targetWs = workspaces.find((w: any) => w.join_code?.toUpperCase() === cleanCode)
    if (!targetWs) {
      throw new Error('Invalid join code or workspace has been deleted.')
    }

    const members = db['workspace_members'] || []
    const existing = members.find((m: any) => m.workspace_id === targetWs.id && m.user_id === userId)
    if (existing) {
      if (existing.status === 'active') {
        throw new Error('You are already an active member of this workspace.')
      } else if (existing.status === 'suspended') {
        throw new Error('Your access to this workspace is suspended.')
      } else {
        existing.status = 'active'
        existing.role = targetWs.default_join_role || 'editor'
        saveStoredData(db)
        return targetWs.id
      }
    }

    const defaultRole = targetWs.default_join_role || 'editor'
    members.push({
      id: `wm-${crypto.randomUUID()}`,
      workspace_id: targetWs.id,
      user_id: userId,
      role: defaultRole,
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    saveStoredData(db)

    // Log Activity in mock DB
    const actLog = db['activity_log'] || []
    actLog.unshift({
      id: crypto.randomUUID(),
      workspace_id: targetWs.id,
      project_id: null,
      action: 'User joined via code',
      entity_type: 'member',
      created_at: new Date().toISOString(),
    })
    db['activity_log'] = actLog
    saveStoredData(db)

    return targetWs.id
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('join_workspace_by_code', {
    p_join_code: cleanCode,
    p_user_id: userId,
  })

  if (error) throw error
  if (!data || !data.success) {
    throw new Error(data?.error || 'Failed to join workspace.')
  }

  return data.workspace_id
}

export async function regenerateJoinCode(workspaceId: string): Promise<string> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (!ws) throw new Error('Workspace not found')
    const newCode = generateMockJoinCode()
    ws.join_code = newCode
    saveStoredData(db)
    return newCode
  }

  const supabase = getSupabaseClient()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let newCode = ''
  for (let i = 0; i < 8; i++) {
    newCode += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const { error } = await supabase
    .from('workspaces')
    .update({ join_code: newCode })
    .eq('id', workspaceId)

  if (error) throw error
  return newCode
}

export async function updateDefaultJoinRole(workspaceId: string, role: 'editor' | 'viewer'): Promise<void> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const workspaces = db['workspaces'] || []
    const ws = workspaces.find((w: any) => w.id === workspaceId)
    if (!ws) throw new Error('Workspace not found')
    ws.default_join_role = role
    saveStoredData(db)
    return
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('workspaces')
    .update({ default_join_role: role })
    .eq('id', workspaceId)

  if (error) throw error
}

export async function updateMemberProfile(
  userId: string,
  updates: { teamTitle?: string; aboutBio?: string; fullName?: string; avatarUrl?: string },
): Promise<void> {
  if (isDemoModeEnabled()) {
    const db = getStoredData()
    const profiles = db['profiles'] || []
    const prof = profiles.find((p: any) => p.id === userId)
    if (prof) {
      if (updates.teamTitle !== undefined) prof.team_title = updates.teamTitle
      if (updates.aboutBio !== undefined) prof.about_bio = updates.aboutBio
      if (updates.fullName !== undefined) prof.full_name = updates.fullName
      if (updates.avatarUrl !== undefined) prof.avatar_url = updates.avatarUrl
      saveStoredData(db)
    }
    return
  }

  const supabase = getSupabaseClient()
  const payload: any = {}
  if (updates.teamTitle !== undefined) payload.team_title = updates.teamTitle
  if (updates.aboutBio !== undefined) payload.about_bio = updates.aboutBio
  if (updates.fullName !== undefined) payload.full_name = updates.fullName
  if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)

  if (error) throw error
}

export * from './workspace-invitation.service'

