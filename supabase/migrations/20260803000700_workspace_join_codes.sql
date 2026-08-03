-- Migration 7: Workspace Join Codes System
-- Filename: 20260803000700_workspace_join_codes.sql
-- Description: Adds join_code and default_join_role fields, generates codes for existing workspaces, and implements join_workspace_by_code RPC.
-- Execution Safety: Transactional, Idempotent, Safe for Supabase SQL Editor.

BEGIN;

-- 1. Create unique alphanumeric generator function
CREATE OR REPLACE FUNCTION public.generate_unique_join_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  new_code TEXT;
  code_exists BOOLEAN;
  i INTEGER;
BEGIN
  LOOP
    new_code := '';
    FOR i IN 1..8 LOOP
      new_code := new_code || substr(chars, floor(random() * 36)::integer + 1, 1);
    END LOOP;
    
    SELECT EXISTS (
      SELECT 1 FROM public.workspaces WHERE join_code = new_code
    ) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Modify workspaces table
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS default_join_role TEXT NOT NULL DEFAULT 'editor' CHECK (default_join_role IN ('editor', 'viewer'));

-- 3. Backfill existing workspaces with unique codes
DO $$
DECLARE
  ws_row RECORD;
BEGIN
  FOR ws_row IN SELECT id FROM public.workspaces WHERE join_code IS NULL LOOP
    UPDATE public.workspaces
    SET join_code = public.generate_unique_join_code()
    WHERE id = ws_row.id;
  END LOOP;
END;
$$;

-- 4. Apply NOT NULL and DEFAULT constraints
ALTER TABLE public.workspaces
  ALTER COLUMN join_code SET NOT NULL,
  ALTER COLUMN join_code SET DEFAULT public.generate_unique_join_code(),
  ALTER COLUMN default_join_role SET DEFAULT 'editor';

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_join_code ON public.workspaces(join_code);

-- 6. Create RPC function for transactional joining by code
CREATE OR REPLACE FUNCTION public.join_workspace_by_code(p_join_code TEXT, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  target_ws RECORD;
  existing_member RECORD;
  result_role TEXT;
BEGIN
  -- 1. Validate join code
  SELECT * FROM public.workspaces
  WHERE join_code = upper(trim(p_join_code)) AND deleted_at IS NULL
  INTO target_ws;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid join code or workspace has been deleted.');
  END IF;

  -- 2. Validate user
  IF p_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User must be authenticated.');
  END IF;

  -- 3. Prevent duplicate membership
  SELECT * FROM public.workspace_members
  WHERE workspace_id = target_ws.id AND user_id = p_user_id
  INTO existing_member;

  IF FOUND THEN
    IF existing_member.status = 'active' THEN
      RETURN json_build_object('success', false, 'error', 'You are already an active member of this workspace.', 'workspace_id', target_ws.id);
    ELSIF existing_member.status = 'suspended' THEN
      RETURN json_build_object('success', false, 'error', 'Your access to this workspace is suspended.');
    ELSE
      -- Reactivate member
      UPDATE public.workspace_members
      SET status = 'active', role = COALESCE(target_ws.default_join_role, 'editor')
      WHERE id = existing_member.id;
      
      -- Log Activity
      INSERT INTO public.activity_logs (workspace_id, action, entity_type, entity_id, created_at)
      VALUES (target_ws.id, 'User joined via code (reactivated)', 'member', p_user_id::text, now());
      
      RETURN json_build_object('success', true, 'workspace_id', target_ws.id);
    END IF;
  END IF;

  -- 4. Assign default role
  result_role := COALESCE(target_ws.default_join_role, 'editor');

  -- 5. Insert workspace_member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status, joined_at)
  VALUES (target_ws.id, p_user_id, result_role, 'active', now());

  -- 6. Log Activity
  INSERT INTO public.activity_logs (workspace_id, action, entity_type, entity_id, created_at)
  VALUES (target_ws.id, 'User joined via code', 'member', p_user_id::text, now());

  RETURN json_build_object('success', true, 'workspace_id', target_ws.id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

NOTIFY pgrst, 'reload schema';

COMMIT;
