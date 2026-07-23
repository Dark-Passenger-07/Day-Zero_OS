-- Day Zero OS V1.0 - Project Workspace Development Module

CREATE TYPE public.project_task_status AS ENUM ('todo', 'in-progress', 'blocked', 'done');
CREATE TYPE public.bug_status AS ENUM ('open', 'triage', 'fixing', 'fixed', 'closed');
CREATE TYPE public.debt_status AS ENUM ('open', 'planned', 'resolved');

CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  status public.project_task_status NOT NULL DEFAULT 'todo',
  priority public.priority_level NOT NULL DEFAULT 'medium',
  notes TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.project_bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  status public.bug_status NOT NULL DEFAULT 'open',
  severity public.priority_level NOT NULL DEFAULT 'medium',
  steps_to_reproduce TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.technical_debt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  status public.debt_status NOT NULL DEFAULT 'open',
  impact TEXT,
  proposed_fix TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.project_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  url TEXT NOT NULL CHECK (length(trim(url)) > 0),
  branch TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.development_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX idx_project_bugs_project_id ON public.project_bugs(project_id);
CREATE INDEX idx_project_bugs_status ON public.project_bugs(status);
CREATE INDEX idx_technical_debt_project_id ON public.technical_debt_items(project_id);
CREATE INDEX idx_technical_debt_status ON public.technical_debt_items(status);
CREATE INDEX idx_project_repositories_project_id ON public.project_repositories(project_id);
CREATE INDEX idx_development_notes_project_id ON public.development_notes(project_id);

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_bugs_updated_at BEFORE UPDATE ON public.project_bugs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_technical_debt_updated_at BEFORE UPDATE ON public.technical_debt_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_repositories_updated_at BEFORE UPDATE ON public.project_repositories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_development_notes_updated_at BEFORE UPDATE ON public.development_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.project_owner_for_activity(target_project_id UUID)
RETURNS UUID AS $$
  SELECT owner_id FROM public.projects WHERE id = target_project_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.log_project_child_activity()
RETURNS TRIGGER AS $$
DECLARE owner UUID;
DECLARE label TEXT;
BEGIN
  owner := public.project_owner_for_activity(COALESCE(NEW.project_id, OLD.project_id));
  label := CASE TG_OP WHEN 'INSERT' THEN 'Created ' WHEN 'UPDATE' THEN 'Updated ' ELSE 'Deleted ' END || TG_ARGV[0];
  INSERT INTO public.activity_logs (project_id, user_id, activity_type, action, entity_type, entity_id)
  VALUES (COALESCE(NEW.project_id, OLD.project_id), owner, 'project_updated', label, TG_ARGV[0], COALESCE(NEW.id, OLD.id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_project_tasks_activity AFTER INSERT OR UPDATE OR DELETE ON public.project_tasks FOR EACH ROW EXECUTE FUNCTION public.log_project_child_activity('task');
CREATE TRIGGER log_project_bugs_activity AFTER INSERT OR UPDATE OR DELETE ON public.project_bugs FOR EACH ROW EXECUTE FUNCTION public.log_project_child_activity('bug');
CREATE TRIGGER log_technical_debt_activity AFTER INSERT OR UPDATE OR DELETE ON public.technical_debt_items FOR EACH ROW EXECUTE FUNCTION public.log_project_child_activity('technical_debt');
CREATE TRIGGER log_project_repositories_activity AFTER INSERT OR UPDATE OR DELETE ON public.project_repositories FOR EACH ROW EXECUTE FUNCTION public.log_project_child_activity('repository');
CREATE TRIGGER log_development_notes_activity AFTER INSERT OR UPDATE OR DELETE ON public.development_notes FOR EACH ROW EXECUTE FUNCTION public.log_project_child_activity('development_note');

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_debt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tasks_project_owner_all" ON public.project_tasks FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));
CREATE POLICY "project_bugs_project_owner_all" ON public.project_bugs FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));
CREATE POLICY "technical_debt_project_owner_all" ON public.technical_debt_items FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));
CREATE POLICY "project_repositories_project_owner_all" ON public.project_repositories FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));
CREATE POLICY "development_notes_project_owner_all" ON public.development_notes FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));

NOTIFY pgrst, 'reload schema';
