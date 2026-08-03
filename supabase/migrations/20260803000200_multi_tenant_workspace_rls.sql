-- Migration 3 of 3: Multi-Tenant Workspace RLS Policies & Security Helpers
-- Description: Reusable SECURITY DEFINER helper functions and workspace-scoped RLS policies across direct and inherited tables.
-- Execution Safety: Transactional, Safe for Supabase SQL Editor.

BEGIN;

-- 1. Helper Function: Is User Active Member of Workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = target_user_id
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

-- 2. Helper Function: Get User Role in Workspace
CREATE OR REPLACE FUNCTION public.get_workspace_role(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id
    AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

-- 3. Helper Function: Can Manage Workspace (Owner or Admin)
CREATE OR REPLACE FUNCTION public.can_manage_workspace(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = target_user_id
      AND status = 'active'
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

-- 4. Helper Function: Is User Member of Project's Workspace (for INHERITED tables)
CREATE OR REPLACE FUNCTION public.is_project_workspace_member(target_project_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id = target_project_id
      AND wm.user_id = target_user_id
      AND wm.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

-- 5. Helper Function: Can Edit Project & Child Items (Owner, Admin, Editor)
CREATE OR REPLACE FUNCTION public.can_edit_project(target_project_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id = target_project_id
      AND wm.user_id = target_user_id
      AND wm.status = 'active'
      AND wm.role IN ('owner', 'admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

-- Drop Legacy Single-Tenant RLS Policies
DROP POLICY IF EXISTS "workspaces_owner_all" ON public.workspaces;
DROP POLICY IF EXISTS "projects_owner_all" ON public.projects;
DROP POLICY IF EXISTS "assets_owner_all" ON public.assets;
DROP POLICY IF EXISTS "knowledge_owner_all" ON public.knowledge_entries;
DROP POLICY IF EXISTS "activity_logs_user_all" ON public.activity_logs;
DROP POLICY IF EXISTS "weekly_debriefs_self_all" ON public.weekly_debriefs;
DROP POLICY IF EXISTS "notifications_self_all" ON public.notifications;
DROP POLICY IF EXISTS "ai_sessions_self_all" ON public.ai_sessions;
DROP POLICY IF EXISTS "milestones_project_owner_all" ON public.milestones;
DROP POLICY IF EXISTS "project_tasks_project_owner_all" ON public.project_tasks;
DROP POLICY IF EXISTS "project_bugs_project_owner_all" ON public.project_bugs;
DROP POLICY IF EXISTS "technical_debt_project_owner_all" ON public.technical_debt_items;
DROP POLICY IF EXISTS "project_repositories_project_owner_all" ON public.project_repositories;
DROP POLICY IF EXISTS "development_notes_project_owner_all" ON public.development_notes;
DROP POLICY IF EXISTS "content_project_owner_all" ON public.content_items;
DROP POLICY IF EXISTS "architecture_decisions_project_owner_all" ON public.architecture_decisions;

-- Enable RLS across all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_debt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Workspaces Policies
CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT USING (public.is_workspace_member(id));
CREATE POLICY "workspaces_update_admin" ON public.workspaces FOR UPDATE USING (public.can_manage_workspace(id));
CREATE POLICY "workspaces_delete_owner" ON public.workspaces FOR DELETE USING (public.get_workspace_role(id) = 'owner' AND is_personal = false);

-- 2. Workspace Members Policies
CREATE POLICY "workspace_members_select" ON public.workspace_members FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "workspace_members_admin_all" ON public.workspace_members FOR ALL USING (public.can_manage_workspace(workspace_id));

-- 3. Workspace Invitations Policies
CREATE POLICY "workspace_invitations_select" ON public.workspace_invitations FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "workspace_invitations_admin_all" ON public.workspace_invitations FOR ALL USING (public.can_manage_workspace(workspace_id));

-- 4. Projects Policies (DIRECT)
CREATE POLICY "projects_select_member" ON public.projects FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "projects_insert_editor" ON public.projects FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) AND public.get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));
CREATE POLICY "projects_update_editor" ON public.projects FOR UPDATE USING (public.is_workspace_member(workspace_id) AND public.get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE USING (public.can_manage_workspace(workspace_id));

-- 5. Inherited Project Child Table Policies
CREATE POLICY "milestones_select" ON public.milestones FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "milestones_write" ON public.milestones FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "project_tasks_select" ON public.project_tasks FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "project_tasks_write" ON public.project_tasks FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "project_bugs_select" ON public.project_bugs FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "project_bugs_write" ON public.project_bugs FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "technical_debt_select" ON public.technical_debt_items FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "technical_debt_write" ON public.technical_debt_items FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "project_repositories_select" ON public.project_repositories FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "project_repositories_write" ON public.project_repositories FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "development_notes_select" ON public.development_notes FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "development_notes_write" ON public.development_notes FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "content_items_select" ON public.content_items FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "content_items_write" ON public.content_items FOR ALL USING (public.can_edit_project(project_id));

CREATE POLICY "architecture_decisions_select" ON public.architecture_decisions FOR SELECT USING (public.is_project_workspace_member(project_id));
CREATE POLICY "architecture_decisions_write" ON public.architecture_decisions FOR ALL USING (public.can_edit_project(project_id));

-- 6. Direct Workspace Table Policies
CREATE POLICY "assets_select_member" ON public.assets FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "assets_write_editor" ON public.assets FOR ALL USING (public.is_workspace_member(workspace_id) AND public.get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));

CREATE POLICY "knowledge_select_member" ON public.knowledge_entries FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "knowledge_write_editor" ON public.knowledge_entries FOR ALL USING (public.is_workspace_member(workspace_id) AND public.get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'));

CREATE POLICY "weekly_debriefs_select_member" ON public.weekly_debriefs FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "weekly_debriefs_write_self" ON public.weekly_debriefs FOR ALL USING (public.is_workspace_member(workspace_id) AND auth.uid() = user_id);

CREATE POLICY "activity_logs_select_member" ON public.activity_logs FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "activity_logs_insert_member" ON public.activity_logs FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

CREATE POLICY "notifications_select_target" ON public.notifications FOR SELECT USING (public.is_workspace_member(workspace_id) AND auth.uid() = user_id);
CREATE POLICY "notifications_update_target" ON public.notifications FOR UPDATE USING (public.is_workspace_member(workspace_id) AND auth.uid() = user_id);

CREATE POLICY "ai_sessions_select_member" ON public.ai_sessions FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "ai_sessions_insert_member" ON public.ai_sessions FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

NOTIFY pgrst, 'reload schema';

COMMIT;
