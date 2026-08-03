-- Migration 6: Production Workspace Invitation System
-- Filename: 20260803000600_workspace_invitation_system.sql
-- Description: Adds enterprise lifecycle fields, composite indexes, and get_invitation_preview() RPC function (TEXT columns only).
-- Execution Safety: Transactional, Safe for Supabase SQL Editor.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Add Invitation Lifecycle Attributes to workspace_invitations (if missing)
ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS invitation_type TEXT NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS secret_hash TEXT,
  ADD COLUMN IF NOT EXISTS accepted_ip INET,
  ADD COLUMN IF NOT EXISTS accepted_device TEXT,
  ADD COLUMN IF NOT EXISTS accepted_browser TEXT,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declined_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS resend_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Composite Indexes for Invitation Performance (No partial predicates)
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_ws_email_status
  ON public.workspace_invitations(workspace_id, email, status);

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_id_version_secret
  ON public.workspace_invitations(id, version, secret_hash);

-- 3. Server-Hashed Pre-Auth Verification RPC Function (get_invitation_preview)
CREATE OR REPLACE FUNCTION public.get_invitation_preview(p_invitation_id UUID, p_secret TEXT)
RETURNS TABLE (
  invitation_id UUID,
  workspace_id UUID,
  workspace_name TEXT,
  workspace_logo TEXT,
  inviter_name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  version INT,
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN
) AS $$
DECLARE
  computed_hash TEXT;
BEGIN
  -- Server-side SHA-256 hashing of raw URL secret
  computed_hash := encode(digest(p_secret, 'sha256'), 'hex');

  RETURN QUERY
  SELECT
    i.id,
    w.id,
    w.name,
    w.logo_url,
    COALESCE(p.full_name, 'A team member'),
    i.email,
    i.role,
    i.status,
    i.version,
    i.expires_at,
    (i.expires_at < now()) AS is_expired
  FROM public.workspace_invitations i
  JOIN public.workspaces w ON w.id = i.workspace_id
  LEFT JOIN public.profiles p ON p.id = i.invited_by
  WHERE i.id = p_invitation_id
    AND (i.secret_hash = computed_hash OR i.token_hash = computed_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp STABLE;

NOTIFY pgrst, 'reload schema';

COMMIT;
