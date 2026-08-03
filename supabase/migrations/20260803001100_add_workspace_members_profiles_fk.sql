BEGIN;

-- Add foreign key constraint between workspace_members and profiles
ALTER TABLE public.workspace_members
  ADD CONSTRAINT fk_workspace_members_profiles
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';

COMMIT;
