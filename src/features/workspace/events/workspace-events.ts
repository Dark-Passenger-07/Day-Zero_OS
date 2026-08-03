import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled } from '@/lib/supabase/mockClient'

export type WorkspaceEventType =
  | 'InvitationCreated'
  | 'InvitationSent'
  | 'InvitationViewed'
  | 'InvitationAccepted'
  | 'InvitationDeclined'
  | 'InvitationCancelled'
  | 'InvitationResent'
  | 'MemberJoined'
  | 'MemberRoleUpdated'
  | 'MemberRemoved'
  | 'OwnershipTransferred'

export type WorkspaceEventPayload = {
  eventType: WorkspaceEventType
  workspaceId: string
  actorId?: string
  targetUserId?: string
  email?: string
  metadata?: Record<string, unknown>
}

type EventListener = (payload: WorkspaceEventPayload) => void

class WorkspaceEventBus {
  private listeners = new Set<EventListener>()

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async publish(payload: WorkspaceEventPayload): Promise<void> {
    // 1. Notify internal listeners
    this.listeners.forEach((cb) => {
      try {
        cb(payload)
      } catch (err) {
        console.error('Error in workspace event listener:', err)
      }
    })

    // 2. Persist to activity_logs automatically
    await this.recordActivityLog(payload).catch((err) =>
      console.error('Failed to record activity log for event:', err),
    )

    // 3. Dispatch system notifications if applicable
    await this.recordNotification(payload).catch((err) =>
      console.error('Failed to record notification for event:', err),
    )
  }

  private async recordActivityLog(payload: WorkspaceEventPayload): Promise<void> {
    const actionText = this.formatActionText(payload)
    if (!actionText) return

    if (isDemoModeEnabled()) return

    const supabase = getSupabaseClient()
    await supabase.from('activity_logs').insert({
      workspace_id: payload.workspaceId,
      user_id: payload.actorId || null,
      action: actionText,
      entity_type: 'invitation',
    })
  }

  private async recordNotification(payload: WorkspaceEventPayload): Promise<void> {
    if (!payload.targetUserId || isDemoModeEnabled()) return

    let notifTitle = ''
    let notifBody = ''
    const notifType: 'project' | 'milestone' | 'content' | 'asset' | 'decision' | 'system' = 'system'

    if (payload.eventType === 'InvitationAccepted') {
      notifTitle = 'Workspace Member Joined'
      notifBody = `${payload.email || 'A new user'} has accepted your invitation and joined the workspace.`
    } else if (payload.eventType === 'InvitationDeclined') {
      notifTitle = 'Invitation Declined'
      notifBody = `${payload.email || 'A user'} has declined the workspace invitation.`
    } else if (payload.eventType === 'MemberRoleUpdated') {
      notifTitle = 'Role Updated'
      notifBody = `Your workspace role has been updated to ${payload.metadata?.role || 'a new role'}.`
    }

    if (!notifTitle) return

    const supabase = getSupabaseClient()
    await supabase.from('notifications').insert({
      workspace_id: payload.workspaceId,
      user_id: payload.targetUserId,
      type: notifType,
      title: notifTitle,
      body: notifBody,
    })
  }

  private formatActionText(payload: WorkspaceEventPayload): string | null {
    const email = payload.email || 'user'
    switch (payload.eventType) {
      case 'InvitationCreated':
        return `Created workspace invitation for ${email}`
      case 'InvitationSent':
        return `Sent invitation email to ${email}`
      case 'InvitationAccepted':
        return `${email} accepted workspace invitation and joined`
      case 'InvitationDeclined':
        return `${email} declined workspace invitation`
      case 'InvitationCancelled':
        return `Cancelled workspace invitation for ${email}`
      case 'InvitationResent':
        return `Resent workspace invitation to ${email}`
      case 'MemberRoleUpdated':
        return `Updated member role for ${email}`
      case 'MemberRemoved':
        return `Removed member ${email} from workspace`
      case 'OwnershipTransferred':
        return `Transferred workspace ownership`
      default:
        return null
    }
  }
}

export const workspaceEventBus = new WorkspaceEventBus()
