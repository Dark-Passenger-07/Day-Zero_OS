-- Day Zero OS V1.0 - Fix activity logging during cascade user deletion
-- Redefine log_project_child_activity trigger function to prevent NULL user_id insertion during cascade deletes

CREATE OR REPLACE FUNCTION public.log_project_child_activity()
RETURNS TRIGGER AS $$
DECLARE owner UUID;
DECLARE label TEXT;
BEGIN
  owner := public.project_owner_for_activity(COALESCE(NEW.project_id, OLD.project_id));
  IF owner IS NOT NULL THEN
    label := CASE TG_OP WHEN 'INSERT' THEN 'Created ' WHEN 'UPDATE' THEN 'Updated ' ELSE 'Deleted ' END || TG_ARGV[0];
    INSERT INTO public.activity_logs (project_id, user_id, activity_type, action, entity_type, entity_id)
    VALUES (COALESCE(NEW.project_id, OLD.project_id), owner, 'project_updated', label, TG_ARGV[0], COALESCE(NEW.id, OLD.id));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
