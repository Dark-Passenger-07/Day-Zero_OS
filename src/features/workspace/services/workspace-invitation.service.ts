import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled } from '@/lib/supabase/mockClient'
import { emailQueueService } from '@/lib/email/email-queue.service'
import { renderInvitationEmail } from '@/lib/email/templates/invitation-template'
import { workspaceEventBus } from '../events/workspace-events'
import type { WorkspaceRole } from './workspace.service'

export type WorkspaceInvitationItem = {
  id: string
  workspaceId: string
  workspaceName?: string
  workspaceLogo?: string | null
  email: string
  role: WorkspaceRole
  invitedBy: string
  inviterName?: string
  invitationType: 'email' | 'link' | 'user' | 'directory'
  version: number
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled' | 'revoked'
  expiresAt: string
  lastSentAt: string
  resendCount: number
  createdAt: string
  isExpired?: boolean
}

async function sha256Hex(secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(secret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSecret(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createWorkspaceInvitation(input: {
  workspaceId: string
  inviterId: string
  inviterName: string
  email: string
  role?: WorkspaceRole
}): Promise<{ invitation: WorkspaceInvitationItem; inviteUrl: string }> {
  const role = input.role ?? 'editor'
  const email = input.email.trim().toLowerCase()
  const supabase = getSupabaseClient()

  // 1. Duplicate & Member Validation Guards
  const { data: existingMembers } = await supabase
    .from('workspace_members')
    .select('id, user_id, profile:profiles(username)')
    .eq('workspace_id', input.workspaceId)
    .eq('status', 'active')

  if (existingMembers && existingMembers.some((m: any) => m.profile?.email === email)) {
    throw new Error('This user is already an active member of this workspace.')
  }

  // 2. Cryptographic Secret Generation
  const rawSecret = generateSecret()
  const secretHash = await sha256Hex(rawSecret)

  // 3. Check for existing pending invitation (resend/update existing vs insert)
  const { data: existingInvite } = await supabase
    .from('workspace_invitations')
    .select('id, version, resend_count')
    .eq('workspace_id', input.workspaceId)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle()

  let invitationId: string
  let nextVersion = 1

  if (existingInvite) {
    invitationId = existingInvite.id
    nextVersion = (existingInvite.version || 1) + 1
    const { error: updateErr } = await supabase
      .from('workspace_invitations')
      .update({
        version: nextVersion,
        secret_hash: secretHash,
        token_hash: secretHash,
        role,
        invited_by: input.inviterId,
        last_sent_at: new Date().toISOString(),
        resend_count: (existingInvite.resend_count || 0) + 1,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', invitationId)

    if (updateErr) throw updateErr
  } else {
    const { data: newInvite, error: insertErr } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: input.workspaceId,
        email,
        role,
        invited_by: input.inviterId,
        invitation_type: 'email',
        version: 1,
        secret_hash: secretHash,
        token_hash: secretHash,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (insertErr) throw insertErr
    invitationId = newInvite.id
  }

  // 4. Fetch Workspace details for Email & Preview
  const { data: ws } = await supabase
    .from('workspaces')
    .select('name, logo_url')
    .eq('id', input.workspaceId)
    .single()

  const workspaceName = ws?.name ?? 'Workspace'
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
  const inviteUrl = `${appUrl}/invite/${invitationId}?secret=${rawSecret}`

  // 5. Render & Enqueue Invitation Email
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const emailPayload = renderInvitationEmail({
    workspaceName,
    workspaceLogo: ws?.logo_url,
    inviterName: input.inviterName,
    role,
    inviteUrl,
    expiresAt,
  })

  await emailQueueService.enqueue({
    to: email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
  })

  // 6. Publish Event
  await workspaceEventBus.publish({
    eventType: existingInvite ? 'InvitationResent' : 'InvitationCreated',
    workspaceId: input.workspaceId,
    actorId: input.inviterId,
    email,
    metadata: { role, invitationId, version: nextVersion },
  })

  const invitation: WorkspaceInvitationItem = {
    id: invitationId,
    workspaceId: input.workspaceId,
    workspaceName,
    workspaceLogo: ws?.logo_url,
    email,
    role,
    invitedBy: input.inviterId,
    inviterName: input.inviterName,
    invitationType: 'email',
    version: nextVersion,
    status: 'pending',
    expiresAt,
    lastSentAt: new Date().toISOString(),
    resendCount: existingInvite ? (existingInvite.resend_count || 0) + 1 : 0,
    createdAt: new Date().toISOString(),
    isExpired: false,
  }

  return { invitation, inviteUrl }
}

export async function getInvitationPreview(
  invitationId: string,
  rawSecret: string,
): Promise<WorkspaceInvitationItem> {
  const supabase = getSupabaseClient()

  if (isDemoModeEnabled()) {
    const { data: inv } = await supabase
      .from('workspace_invitations')
      .select('*, workspace:workspaces(name, logo_url), inviter:profiles(full_name)')
      .eq('id', invitationId)
      .single()

    if (!inv) throw new Error('Invitation not found.')
    const isExpired = new Date(inv.expires_at).getTime() < Date.now()
    return {
      id: inv.id,
      workspaceId: inv.workspace_id,
      workspaceName: inv.workspace?.name ?? 'Builder Workspace',
      workspaceLogo: inv.workspace?.logo_url ?? null,
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invited_by,
      inviterName: inv.inviter?.full_name ?? 'Workspace Admin',
      invitationType: inv.invitation_type ?? 'email',
      version: inv.version ?? 1,
      status: inv.status,
      expiresAt: inv.expires_at,
      lastSentAt: inv.last_sent_at ?? inv.created_at,
      resendCount: inv.resend_count ?? 0,
      createdAt: inv.created_at,
      isExpired,
    }
  }

  // Production Mode: Invoke get_invitation_preview RPC
  const { data, error } = await supabase.rpc('get_invitation_preview', {
    p_invitation_id: invitationId,
    p_secret: rawSecret,
  })

  if (error || !data || data.length === 0) {
    throw new Error('Invalid or expired invitation link.')
  }

  const row = data[0]
  return {
    id: row.invitation_id,
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    workspaceLogo: row.workspace_logo,
    email: row.email,
    role: row.role as WorkspaceRole,
    invitedBy: '',
    inviterName: row.inviter_name,
    invitationType: 'email',
    version: row.version ?? 1,
    status: row.status as WorkspaceInvitationItem['status'],
    expiresAt: row.expires_at,
    lastSentAt: row.expires_at,
    resendCount: 0,
    createdAt: row.expires_at,
    isExpired: Boolean(row.is_expired),
  }
}

export async function acceptWorkspaceInvitation(
  invitationId: string,
  rawSecret: string,
  user: { id: string; email?: string },
): Promise<{ workspaceId: string }> {
  const preview = await getInvitationPreview(invitationId, rawSecret)
  if (preview.status !== 'pending' || preview.isExpired) {
    throw new Error('This invitation is no longer active.')
  }

  const supabase = getSupabaseClient()

  // 1. Transactional Member Insertion
  const { error: memberError } = await supabase.from('workspace_members').insert({
    workspace_id: preview.workspaceId,
    user_id: user.id,
    role: preview.role,
    status: 'active',
  })

  if (memberError && !memberError.message.includes('unique')) {
    throw memberError
  }

  // 2. Mark Invitation Accepted
  await supabase
    .from('workspace_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq('id', invitationId)

  // 3. Publish Acceptance Events
  await workspaceEventBus.publish({
    eventType: 'InvitationAccepted',
    workspaceId: preview.workspaceId,
    actorId: user.id,
    targetUserId: preview.invitedBy,
    email: user.email || preview.email,
    metadata: { role: preview.role, invitationId },
  })

  return { workspaceId: preview.workspaceId }
}

export async function declineWorkspaceInvitation(
  invitationId: string,
  rawSecret: string,
  user: { id: string; email?: string },
): Promise<void> {
  const preview = await getInvitationPreview(invitationId, rawSecret)
  const supabase = getSupabaseClient()

  await supabase
    .from('workspace_invitations')
    .update({
      status: 'declined',
      declined_at: new Date().toISOString(),
      declined_by: user.id,
    })
    .eq('id', invitationId)

  await workspaceEventBus.publish({
    eventType: 'InvitationDeclined',
    workspaceId: preview.workspaceId,
    actorId: user.id,
    targetUserId: preview.invitedBy,
    email: user.email || preview.email,
  })
}

export async function revokeWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
  adminId: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  await supabase
    .from('workspace_invitations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: adminId,
    })
    .eq('id', invitationId)
    .eq('workspace_id', workspaceId)

  await workspaceEventBus.publish({
    eventType: 'InvitationCancelled',
    workspaceId,
    actorId: adminId,
    metadata: { invitationId },
  })
}

export async function resendWorkspaceInvitation(
  workspaceId: string,
  invitationId: string,
  adminId: string,
  inviterName: string,
): Promise<void> {
  const supabase = getSupabaseClient()
  const { data: inv } = await supabase
    .from('workspace_invitations')
    .select('email, role')
    .eq('id', invitationId)
    .single()

  if (!inv) throw new Error('Invitation record not found.')

  await createWorkspaceInvitation({
    workspaceId,
    inviterId: adminId,
    inviterName,
    email: inv.email,
    role: inv.role as WorkspaceRole,
  })
}

export async function listPendingWorkspaceInvitations(
  workspaceId: string,
): Promise<WorkspaceInvitationItem[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select('id, workspace_id, email, role, invited_by, invitation_type, version, status, expires_at, last_sent_at, resend_count, created_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    workspaceId: item.workspace_id,
    email: item.email,
    role: item.role,
    invitedBy: item.invited_by,
    invitationType: item.invitation_type ?? 'email',
    version: item.version ?? 1,
    status: item.status,
    expiresAt: item.expires_at,
    lastSentAt: item.last_sent_at ?? item.created_at,
    resendCount: item.resend_count ?? 0,
    createdAt: item.created_at,
    isExpired: new Date(item.expires_at).getTime() < Date.now(),
  }))
}

export async function listWorkspaceInvitations(
  workspaceId: string,
): Promise<WorkspaceInvitationItem[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select('id, workspace_id, email, role, invited_by, invitation_type, version, status, expires_at, last_sent_at, resend_count, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    workspaceId: item.workspace_id,
    email: item.email,
    role: item.role,
    invitedBy: item.invited_by,
    invitationType: item.invitation_type ?? 'email',
    version: item.version ?? 1,
    status: item.status,
    expiresAt: item.expires_at,
    lastSentAt: item.last_sent_at ?? item.created_at,
    resendCount: item.resend_count ?? 0,
    createdAt: item.created_at,
    isExpired: new Date(item.expires_at).getTime() < Date.now(),
  }))
}

export async function copyWorkspaceInvitationLink(
  workspaceId: string,
  invitationId: string,
): Promise<string> {
  const supabase = getSupabaseClient()
  const rawSecret = generateSecret()
  const secretHash = await sha256Hex(rawSecret)

  if (isDemoModeEnabled()) {
    const dataStr = localStorage.getItem('day_zero_os_mock_db')
    const db = dataStr ? JSON.parse(dataStr) : {}
    const invList = db.workspace_invitations || []
    const invite = invList.find((i: any) => i.id === invitationId)
    if (invite) {
      invite.secret_hash = secretHash
      invite.token_hash = secretHash
      localStorage.setItem('day_zero_os_mock_db', JSON.stringify(db))
    }
  } else {
    const { error } = await supabase
      .from('workspace_invitations')
      .update({
        secret_hash: secretHash,
        token_hash: secretHash,
      })
      .eq('id', invitationId)
      .eq('workspace_id', workspaceId)

    if (error) throw error
  }

  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '')
  return `${appUrl}/invite/${invitationId}?secret=${rawSecret}`
}


