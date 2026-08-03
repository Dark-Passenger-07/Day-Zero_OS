BEGIN;

-- 1. Add global profile fields to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS github TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Backfill display_name from full_name if display_name is null
UPDATE public.profiles
SET display_name = full_name
WHERE display_name IS NULL;

-- 2. Add workspace-specific fields to public.workspace_members
ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS team_title TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS team_bio TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline'));

-- Update handle_new_user trigger function to populate display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ws_id UUID;
  base_slug_input TEXT;
  ws_slug TEXT;
BEGIN
  -- Preserve Profile Creation
  INSERT INTO public.profiles (id, full_name, username, avatar_url, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    email = COALESCE(profiles.email, EXCLUDED.email),
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name);

  -- Generate Collision-Free Personal Workspace Slug
  base_slug_input := split_part(COALESCE(NEW.email, 'user'), '@', 1) || '-personal';
  ws_slug := public.generate_unique_workspace_slug(base_slug_input);

  -- Create Personal Workspace
  INSERT INTO public.workspaces (owner_id, name, slug, is_personal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'workspace_name', 'Personal Workspace'),
    ws_slug,
    true
  )
  RETURNING id INTO ws_id;

  -- Create Owner Membership Entry
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (ws_id, NEW.id, 'owner', 'active')
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner', status = 'active';

  -- Upsert User Settings
  INSERT INTO public.user_settings (user_id, current_workspace_id)
  VALUES (NEW.id, ws_id)
  ON CONFLICT (user_id) DO UPDATE SET
    current_workspace_id = COALESCE(public.user_settings.current_workspace_id, EXCLUDED.current_workspace_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

NOTIFY pgrst, 'reload schema';

COMMIT;
