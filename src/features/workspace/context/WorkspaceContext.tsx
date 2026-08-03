import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  listUserWorkspaces,
  resolveCurrentWorkspaceId,
  setCurrentWorkspace,
  createWorkspace as createWorkspaceService,
  getWorkspaceMembers,
  getWorkspaceInvitations,
  inviteWorkspaceMember,
  revokeWorkspaceInvitation,
  transferWorkspaceOwnership,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  setCachedActiveWorkspaceId,
  deleteWorkspace as deleteWorkspaceService,
  leaveWorkspace as leaveWorkspaceService,
  updateWorkspaceDetails as updateWorkspaceDetailsService,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceInvitation,
  type WorkspaceRole,
} from '../services/workspace.service'

type WorkspaceContextValue = {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  workspaceId: string | null
  userRole: WorkspaceRole | null
  members: WorkspaceMember[]
  invitations: WorkspaceInvitation[]
  isLoading: boolean
  error: Error | null
  switchWorkspace: (workspaceId: string) => Promise<void>
  createWorkspace: (name: string) => Promise<Workspace>
  inviteMember: (email: string, role?: 'admin' | 'editor' | 'viewer') => Promise<void>
  revokeInvitation: (invitationId: string) => Promise<void>
  transferOwnership: (newOwnerId: string) => Promise<void>
  removeMember: (memberUserId: string) => Promise<void>
  updateMemberRole: (memberUserId: string, newRole: 'admin' | 'editor' | 'viewer') => Promise<void>
  deleteWorkspace: (workspaceId: string) => Promise<void>
  leaveWorkspace: (workspaceId: string) => Promise<void>
  updateWorkspaceDetails: (updates: { name?: string; logoUrl?: string | null; description?: string }) => Promise<void>
  refreshWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const loadWorkspaceDetails = useCallback(async (wsId: string) => {
    try {
      const [mems, invs] = await Promise.all([
        getWorkspaceMembers(wsId).catch(() => []),
        getWorkspaceInvitations(wsId).catch(() => []),
      ])
      setMembers(mems)
      setInvitations(invs)
    } catch (err) {
      console.error('Failed to load workspace details:', err)
    }
  }, [])

  const loadWorkspaces = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWorkspaces([])
      setCurrentWorkspaceState(null)
      setMembers([])
      setInvitations([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let list = await listUserWorkspaces(user.id)

      // Fallback: If user has zero workspaces, auto-create Personal Workspace
      if (list.length === 0) {
        const personalWs = await createWorkspaceService(user.id, 'Personal Workspace')
        list = [personalWs]
      }

      setWorkspaces(list)

      // Resolve active workspace using priority rules
      const activeWsId = await resolveCurrentWorkspaceId(user.id)
      const activeWs = list.find((w) => w.id === activeWsId) ?? list[0]

      setCurrentWorkspaceState(activeWs)
      setCachedActiveWorkspaceId(activeWs.id)

      await loadWorkspaceDetails(activeWs.id)
    } catch (err: any) {
      console.error('Error loading workspaces:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [user, isAuthenticated, loadWorkspaceDetails])

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  const switchWorkspaceHandler = useCallback(
    async (targetWorkspaceId: string) => {
      if (!user) return
      const target = workspaces.find((w) => w.id === targetWorkspaceId)
      if (!target) return

      setIsLoading(true)
      try {
        await setCurrentWorkspace(user.id, targetWorkspaceId)
        setCurrentWorkspaceState(target)
        await loadWorkspaceDetails(targetWorkspaceId)
      } catch (err: any) {
        console.error('Error switching workspace:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    },
    [user, workspaces, loadWorkspaceDetails],
  )

  const createWorkspaceHandler = useCallback(
    async (name: string): Promise<Workspace> => {
      if (!user) throw new Error('User must be logged in to create a workspace.')
      setIsLoading(true)
      try {
        const newWs = await createWorkspaceService(user.id, name)
        setWorkspaces((prev) => [...prev, newWs])
        setCurrentWorkspaceState(newWs)
        await loadWorkspaceDetails(newWs.id)
        return newWs
      } finally {
        setIsLoading(false)
      }
    },
    [user, loadWorkspaceDetails],
  )

  const inviteMemberHandler = useCallback(
    async (email: string, role: 'admin' | 'editor' | 'viewer' = 'editor') => {
      if (!user || !currentWorkspace) return
      await inviteWorkspaceMember(currentWorkspace.id, user.id, email, role)
      const invs = await getWorkspaceInvitations(currentWorkspace.id)
      setInvitations(invs)
    },
    [user, currentWorkspace],
  )

  const revokeInvitationHandler = useCallback(
    async (invitationId: string) => {
      if (!currentWorkspace) return
      await revokeWorkspaceInvitation(currentWorkspace.id, invitationId)
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId))
    },
    [currentWorkspace],
  )

  const transferOwnershipHandler = useCallback(
    async (newOwnerId: string) => {
      if (!user || !currentWorkspace) return
      await transferWorkspaceOwnership(currentWorkspace.id, user.id, newOwnerId)
      await loadWorkspaces()
    },
    [user, currentWorkspace, loadWorkspaces],
  )

  const removeMemberHandler = useCallback(
    async (memberUserId: string) => {
      if (!currentWorkspace) return
      await removeWorkspaceMember(currentWorkspace.id, memberUserId)
      setMembers((prev) => prev.filter((m) => m.userId !== memberUserId))
    },
    [currentWorkspace],
  )

  const updateMemberRoleHandler = useCallback(
    async (memberUserId: string, newRole: 'admin' | 'editor' | 'viewer') => {
      if (!currentWorkspace) return
      await updateWorkspaceMemberRole(currentWorkspace.id, memberUserId, newRole)
      setMembers((prev) =>
        prev.map((m) => (m.userId === memberUserId ? { ...m, role: newRole } : m)),
      )
    },
    [currentWorkspace],
  )

  const deleteWorkspaceHandler = useCallback(
    async (workspaceId: string) => {
      await deleteWorkspaceService(workspaceId)
      await loadWorkspaces()
    },
    [loadWorkspaces],
  )

  const leaveWorkspaceHandler = useCallback(
    async (workspaceId: string) => {
      if (!user) return
      await leaveWorkspaceService(workspaceId, user.id)
      await loadWorkspaces()
    },
    [user, loadWorkspaces],
  )

  const updateWorkspaceDetailsHandler = useCallback(
    async (updates: { name?: string; logoUrl?: string | null; description?: string }) => {
      if (!currentWorkspace) return
      await updateWorkspaceDetailsService(currentWorkspace.id, updates)
      await loadWorkspaces()
    },
    [currentWorkspace, loadWorkspaces],
  )

  const userRole: WorkspaceRole | null =
    members.find((m) => m.userId === user?.id)?.role ??
    (currentWorkspace?.ownerId === user?.id ? 'owner' : null)

  const value: WorkspaceContextValue = {
    workspaces,
    currentWorkspace,
    workspaceId: currentWorkspace?.id ?? null,
    userRole,
    members,
    invitations,
    isLoading,
    error,
    switchWorkspace: switchWorkspaceHandler,
    createWorkspace: createWorkspaceHandler,
    inviteMember: inviteMemberHandler,
    revokeInvitation: revokeInvitationHandler,
    transferOwnership: transferOwnershipHandler,
    removeMember: removeMemberHandler,
    updateMemberRole: updateMemberRoleHandler,
    deleteWorkspace: deleteWorkspaceHandler,
    leaveWorkspace: leaveWorkspaceHandler,
    updateWorkspaceDetails: updateWorkspaceDetailsHandler,
    refreshWorkspaces: loadWorkspaces,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
