BEGIN;

-- 1. Create a trigger function to validate workspace_members update requests
CREATE OR REPLACE FUNCTION public.check_member_update_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- If the actor is a Workspace Owner or Workspace Admin, they can update anything
  IF EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = OLD.workspace_id AND owner_id = auth.uid()
  ) OR public.can_manage_workspace(OLD.workspace_id) THEN
    RETURN NEW;
  END IF;

  -- Otherwise, a normal member can ONLY update their own row
  IF OLD.user_id = auth.uid() THEN
    -- Security check: Prevent role escalation or status modifications
    IF NEW.role IS DISTINCT FROM OLD.role OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify your own role or status.';
    END IF;
    RETURN NEW;
  END IF;

  -- Block any other updates
  RAISE EXCEPTION 'Access Denied: You do not have permission to update this membership.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Bind the trigger to the workspace_members table
DROP TRIGGER IF EXISTS tr_check_member_update_permissions ON public.workspace_members;
CREATE TRIGGER tr_check_member_update_permissions
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_member_update_permissions();

-- 3. Update RLS policies to allow update calls for self-memberships
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
CREATE POLICY "workspace_members_update" ON public.workspace_members
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
    )
    OR public.can_manage_workspace(workspace_id)
  );

NOTIFY pgrst, 'reload schema';

COMMIT;
