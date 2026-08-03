-- Migration 2 of 3: Multi-Tenant Workspace Data Preservation & Backfill
-- Description: Idempotent data migration populating Personal Workspaces and backfilling workspace_id across orphan records without data loss.
-- Execution Safety: Transactional, Idempotent, Safe for Supabase SQL Editor.

BEGIN;

-- Helper Function: Unique Slug Generator with Collision Resolution Strategy
CREATE OR REPLACE FUNCTION public.generate_unique_workspace_slug(base_str TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_slug TEXT;
  candidate_slug TEXT;
  counter INT := 0;
BEGIN
  clean_slug := lower(regexp_replace(trim(base_str), '[^a-zA-Z0-9]+', '-', 'g'));
  clean_slug := regexp_replace(clean_slug, '(^-+|-+$)', '', 'g');
  IF clean_slug = '' THEN
    clean_slug := 'workspace';
  END IF;
  
  candidate_slug := clean_slug;
  WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = candidate_slug) LOOP
    candidate_slug := clean_slug || '-' || encode(gen_random_bytes(2), 'hex');
    counter := counter + 1;
    IF counter > 10 THEN
      candidate_slug := clean_slug || '-' || replace(gen_random_uuid()::text, '-', '');
      EXIT;
    END IF;
  END LOOP;

  RETURN candidate_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Migration Function: Backfills Personal Workspaces and orphan entity records for existing users
CREATE OR REPLACE FUNCTION public.migrate_existing_data_to_workspaces()
RETURNS VOID AS $$
DECLARE
  u RECORD;
  ws_id UUID;
  base_slug_input TEXT;
  ws_slug TEXT;
BEGIN
  -- Iterate over every authenticated user
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    -- 1. Ensure Profile exists
    INSERT INTO public.profiles (id, full_name, username, avatar_url)
    VALUES (
      u.id,
      COALESCE(u.raw_user_meta_data->>'full_name', u.email),
      COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
      u.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Resolve or Create Personal Workspace
    SELECT id INTO ws_id FROM public.workspaces WHERE owner_id = u.id AND is_personal = true LIMIT 1;

    IF ws_id IS NULL THEN
      SELECT id INTO ws_id FROM public.workspaces WHERE owner_id = u.id ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF ws_id IS NULL THEN
      base_slug_input := split_part(COALESCE(u.email, 'user'), '@', 1) || '-personal';
      ws_slug := public.generate_unique_workspace_slug(base_slug_input);

      INSERT INTO public.workspaces (owner_id, name, slug, is_personal)
      VALUES (
        u.id,
        COALESCE(u.raw_user_meta_data->>'workspace_name', 'Personal Workspace'),
        ws_slug,
        true
      )
      RETURNING id INTO ws_id;
    ELSE
      UPDATE public.workspaces SET is_personal = true WHERE id = ws_id AND is_personal = false;
    END IF;

    -- 3. Ensure Owner Membership Entry in workspace_members
    INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
    VALUES (ws_id, u.id, 'owner', 'active')
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner', status = 'active';

    -- 4. Upsert User Settings
    INSERT INTO public.user_settings (user_id, current_workspace_id)
    VALUES (u.id, ws_id)
    ON CONFLICT (user_id) DO UPDATE SET
      current_workspace_id = COALESCE(public.user_settings.current_workspace_id, EXCLUDED.current_workspace_id);

    -- 5. Backfill Orphan Records for this user
    UPDATE public.projects SET workspace_id = ws_id WHERE owner_id = u.id AND workspace_id IS NULL;
    UPDATE public.assets SET workspace_id = ws_id WHERE owner_id = u.id AND workspace_id IS NULL;
    UPDATE public.knowledge_entries SET workspace_id = ws_id WHERE owner_id = u.id AND workspace_id IS NULL;
    UPDATE public.weekly_debriefs SET workspace_id = ws_id WHERE user_id = u.id AND workspace_id IS NULL;
    UPDATE public.activity_logs SET workspace_id = ws_id WHERE user_id = u.id AND workspace_id IS NULL;
    UPDATE public.notifications SET workspace_id = ws_id WHERE user_id = u.id AND workspace_id IS NULL;
    UPDATE public.ai_sessions SET workspace_id = ws_id WHERE user_id = u.id AND workspace_id IS NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Execute the migration function
SELECT public.migrate_existing_data_to_workspaces();

-- Update handle_new_user trigger to preserve profile, settings upsert, personal workspace, and owner membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ws_id UUID;
  base_slug_input TEXT;
  ws_slug TEXT;
BEGIN
  -- 1. Preserve Profile Creation
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url;

  -- 2. Generate Collision-Free Personal Workspace Slug
  base_slug_input := split_part(COALESCE(NEW.email, 'user'), '@', 1) || '-personal';
  ws_slug := public.generate_unique_workspace_slug(base_slug_input);

  -- 3. Create Personal Workspace
  INSERT INTO public.workspaces (owner_id, name, slug, is_personal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'workspace_name', 'Personal Workspace'),
    ws_slug,
    true
  )
  RETURNING id INTO ws_id;

  -- 4. Create Owner Membership Entry (Permissions Source of Truth)
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (ws_id, NEW.id, 'owner', 'active')
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner', status = 'active';

  -- 5. Upsert User Settings (Centralized Preferences Store)
  INSERT INTO public.user_settings (user_id, current_workspace_id)
  VALUES (NEW.id, ws_id)
  ON CONFLICT (user_id) DO UPDATE SET
    current_workspace_id = COALESCE(public.user_settings.current_workspace_id, EXCLUDED.current_workspace_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

COMMIT;
