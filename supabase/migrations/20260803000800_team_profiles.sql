BEGIN;

-- 1. Add email, team_title, and about_bio to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS team_title TEXT,
  ADD COLUMN IF NOT EXISTS about_bio TEXT;

-- 2. Backfill email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Update handle_new_user trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE workspace_id UUID;
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);

  INSERT INTO public.workspaces (owner_id, name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'workspace_name', 'My Workspace'), lower(replace(split_part(NEW.email, '@', 1), '.', '-')))
  RETURNING id INTO workspace_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Refresh schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
