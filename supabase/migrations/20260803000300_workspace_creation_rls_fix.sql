-- Migration: Workspace Creation RLS Fix
-- Filename: 20260803000300_workspace_creation_rls_fix.sql
-- Description: Fixes missing INSERT policy on workspaces and circular dependency on workspace_members during initial workspace bootstrap.
-- Execution Safety: Transactional, Safe for Supabase SQL Editor.

BEGIN;

-- ============================================================================
-- 1. FIX WORKSPACES RLS POLICIES
-- ============================================================================

-- Drop legacy/broken policies on workspaces
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_insert_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update_admin" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete_owner" ON public.workspaces;

-- SELECT: User can view workspace if they are the direct owner OR an active member
CREATE POLICY "workspaces_select_member" ON public.workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR public.is_workspace_member(id)
  );

-- INSERT: Authenticated user can create a brand-new workspace when owner_id = auth.uid()
CREATE POLICY "workspaces_insert_owner" ON public.workspaces
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND owner_id = auth.uid()
  );

-- UPDATE: Workspace owner or active admin/owner member can update workspace
CREATE POLICY "workspaces_update_admin" ON public.workspaces
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR public.can_manage_workspace(id)
  );

-- DELETE: Workspace owner can delete non-personal workspaces
CREATE POLICY "workspaces_delete_owner" ON public.workspaces
  FOR DELETE
  USING (
    (owner_id = auth.uid() OR public.get_workspace_role(id) = 'owner')
    AND is_personal = false
  );

-- ============================================================================
-- 2. FIX WORKSPACE MEMBERS RLS POLICIES
-- ============================================================================

-- Drop legacy/broken policies on workspace_members
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_admin_all" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

-- SELECT: Member can view membership list if they are in the workspace or workspace owner
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.is_workspace_member(workspace_id)
  );

-- INSERT: User can insert themselves as 'owner' during workspace bootstrap OR admin/owner can add members
CREATE POLICY "workspace_members_insert" ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
      )
    )
    OR public.can_manage_workspace(workspace_id)
  );

-- UPDATE: Workspace owner or workspace admin can update member roles
CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.can_manage_workspace(workspace_id)
  );

-- DELETE: Workspace owner or workspace admin can remove members
CREATE POLICY "workspace_members_delete" ON public.workspace_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.can_manage_workspace(workspace_id)
  );

-- ============================================================================
-- 3. FIX WORKSPACE INVITATIONS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "workspace_invitations_select" ON public.workspace_invitations;
DROP POLICY IF EXISTS "workspace_invitations_admin_all" ON public.workspace_invitations;

CREATE POLICY "workspace_invitations_select" ON public.workspace_invitations
  FOR SELECT
  USING (
    email = auth.email()
    OR EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.is_workspace_member(workspace_id)
  );

CREATE POLICY "workspace_invitations_admin_all" ON public.workspace_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.can_manage_workspace(workspace_id)
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
