BEGIN;

-- 1. Fix trigger handle_new_user to ensure workspace owner membership is always created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ws_id UUID;
  base_slug_input TEXT;
  ws_slug TEXT;
BEGIN
  -- Preserve Profile Creation
  INSERT INTO public.profiles (id, full_name, username, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    email = COALESCE(profiles.email, EXCLUDED.email);

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

-- 2. Add SELECT RLS policy on profiles to allow fellow workspace members to see each other's profile metadata
DROP POLICY IF EXISTS "profiles_select_workspace_members" ON public.profiles;
CREATE POLICY "profiles_select_workspace_members" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_members m1
      JOIN public.workspace_members m2 ON m1.workspace_id = m2.workspace_id
      WHERE m1.user_id = auth.uid()
        AND m2.user_id = profiles.id
        AND m1.status = 'active'
        AND m2.status = 'active'
    )
  );

-- 3. Backfill missing owner memberships in workspace_members table for any existing workspaces
INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
SELECT id, owner_id, 'owner', 'active'
FROM public.workspaces
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner', status = 'active';

-- 4. Audit RLS on workspaces, workspace_members, workspace_invitations to ensure members can SELECT them
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
CREATE POLICY "workspaces_select_member" ON public.workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR public.is_workspace_member(id)
  );

DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.is_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS "workspace_invitations_select" ON public.workspace_invitations;
CREATE POLICY "workspace_invitations_select" ON public.workspace_invitations
  FOR SELECT
  USING (
    email = auth.email()
    OR EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.is_workspace_member(workspace_id)
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
