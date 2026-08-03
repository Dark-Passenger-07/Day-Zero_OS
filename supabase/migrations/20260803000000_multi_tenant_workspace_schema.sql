-- Migration 1 of 3: Multi-Tenant Workspace Architecture Schema
-- Description: Adds workspace membership, invitations, branding, audit fields, and composite indexes.
-- Execution Safety: Transactional, Idempotent, Safe for Supabase SQL Editor.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Modify workspaces table
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS is_personal BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspace_members_unique_user UNIQUE (workspace_id, user_id)
);

-- 3. Create workspace_invitations table
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add DIRECT workspace_id to independent entities
ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.knowledge_entries
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.weekly_debriefs
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.ai_sessions
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 5. Add Audit Fields to INHERITED Project Child Tables
ALTER TABLE public.project_tasks
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.project_bugs
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.technical_debt_items
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.project_repositories
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.development_notes
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Add Expanded User Settings Columns
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS current_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS date_format TEXT NOT NULL DEFAULT 'MMM D, YYYY',
  ADD COLUMN IF NOT EXISTS time_format TEXT NOT NULL DEFAULT '12h';

-- 7. Create Composite Performance Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_ws ON public.workspace_members(user_id, workspace_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token_hash ON public.workspace_invitations(token_hash) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_projects_ws_status ON public.projects(workspace_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_ws_created ON public.assets(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_ws_created ON public.knowledge_entries(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_debriefs_ws_user_week ON public.weekly_debriefs(workspace_id, user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_ws_created ON public.activity_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_ws_user_read ON public.notifications(workspace_id, user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_ws_created ON public.ai_sessions(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON public.project_tasks(assigned_to) WHERE status != 'done';

-- 8. Ownership Transfer Transaction Helper Function
CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(target_workspace_id UUID, new_owner_id UUID)
RETURNS VOID AS $$
DECLARE
  current_owner_id UUID;
BEGIN
  SELECT owner_id INTO current_owner_id FROM public.workspaces WHERE id = target_workspace_id;
  IF current_owner_id IS NULL OR current_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the current workspace owner can transfer ownership.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = target_workspace_id AND user_id = new_owner_id AND status = 'active') THEN
    RAISE EXCEPTION 'Target owner must be an active member of this workspace.';
  END IF;

  UPDATE public.workspace_members SET role = 'owner' WHERE workspace_id = target_workspace_id AND user_id = new_owner_id;
  UPDATE public.workspace_members SET role = 'admin' WHERE workspace_id = target_workspace_id AND user_id = current_owner_id;
  UPDATE public.workspaces SET owner_id = new_owner_id, updated_at = now() WHERE id = target_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMIT;
