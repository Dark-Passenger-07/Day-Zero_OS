-- Day Zero OS V1.0 MVP - Production Supabase Schema
-- Source of truth: PRD + TDS. Persistence layer: Supabase/PostgreSQL only.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE public.project_status AS ENUM ('active', 'in-progress', 'completed', 'overdue', 'archived');
CREATE TYPE public.priority_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.milestone_status AS ENUM ('todo', 'in-progress', 'completed');
CREATE TYPE public.content_status AS ENUM ('idea', 'research', 'outline', 'script', 'recording', 'editing', 'thumbnail', 'seo', 'published', 'analytics');
CREATE TYPE public.knowledge_category AS ENUM ('research', 'lesson', 'framework', 'reference', 'personal-note');
CREATE TYPE public.asset_type AS ENUM ('image', 'video', 'pdf', 'logo', 'document', 'link', 'github', 'figma', 'reference');
CREATE TYPE public.notification_type AS ENUM ('project', 'milestone', 'content', 'asset', 'decision', 'system');
CREATE TYPE public.activity_type AS ENUM ('project_created', 'project_updated', 'milestone_completed', 'content_published', 'asset_uploaded', 'decision_created', 'knowledge_created', 'weekly_debrief_created', 'settings_updated');
CREATE TYPE public.ai_provider AS ENUM ('openai', 'anthropic', 'google', 'local', 'other');

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles extend auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  workspace_name TEXT NOT NULL DEFAULT 'My Workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspaces_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  accent_color TEXT NOT NULL DEFAULT '#3b82f6',
  sidebar_layout TEXT NOT NULL DEFAULT 'standard',
  default_project_view TEXT NOT NULL DEFAULT 'board',
  notifications JSONB NOT NULL DEFAULT '{"email": true, "push": false}'::jsonb,
  ai_enabled BOOLEAN NOT NULL DEFAULT false,
  ai_provider public.ai_provider,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'en',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'active',
  priority public.priority_level NOT NULL DEFAULT 'medium',
  category TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  cover_image_url TEXT,
  start_date DATE,
  deadline DATE,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT projects_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT projects_deadline_after_start CHECK (deadline IS NULL OR start_date IS NULL OR deadline >= start_date)
);

CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status public.milestone_status NOT NULL DEFAULT 'todo',
  due_date DATE,
  completed_date DATE,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT milestones_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type public.asset_type NOT NULL DEFAULT 'document',
  file_name TEXT NOT NULL,
  file_url TEXT,
  storage_bucket TEXT,
  storage_path TEXT,
  external_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  search_vector TSVECTOR,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT assets_file_name_not_empty CHECK (length(trim(file_name)) > 0)
);

CREATE TABLE public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  series TEXT,
  title TEXT NOT NULL,
  status public.content_status NOT NULL DEFAULT 'idea',
  research_notes TEXT,
  outline TEXT,
  script TEXT,
  thumbnail_asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  publish_date DATE,
  analytics JSONB NOT NULL DEFAULT '{}'::jsonb,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE TABLE public.knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category public.knowledge_category NOT NULL DEFAULT 'research',
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source TEXT,
  starred BOOLEAN NOT NULL DEFAULT false,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT knowledge_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE TABLE public.architecture_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  reason TEXT,
  alternatives TEXT,
  impact TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decided_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT architecture_decision_not_empty CHECK (length(trim(decision)) > 0)
);

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL DEFAULT 'project_updated',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.weekly_debriefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  wins TEXT[] NOT NULL DEFAULT '{}',
  mistakes TEXT[] NOT NULL DEFAULT '{}',
  challenges TEXT[] NOT NULL DEFAULT '{}',
  lessons TEXT[] NOT NULL DEFAULT '{}',
  ai_discoveries TEXT[] NOT NULL DEFAULT '{}',
  next_week_goals TEXT[] NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT weekly_debrief_range CHECK (week_end >= week_start),
  CONSTRAINT weekly_debrief_unique_week UNIQUE (user_id, week_start)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider public.ai_provider NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  category TEXT,
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  saved BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compatibility views for already-wired UI services.
CREATE VIEW public.decisions WITH (security_invoker = true) AS
SELECT
  id,
  project_id,
  decision,
  reason,
  alternatives AS alternatives_considered,
  NULL::TEXT AS final_choice,
  impact,
  decided_at,
  created_at,
  created_by
FROM public.architecture_decisions;

CREATE VIEW public.activity_log WITH (security_invoker = true) AS
SELECT id, project_id, user_id, action, entity_type, entity_id, metadata, created_at
FROM public.activity_logs;

-- Updatable view triggers for compatibility inserts.
CREATE OR REPLACE FUNCTION public.insert_decision_view()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.architecture_decisions (project_id, decision, reason, alternatives, impact, created_by, decided_at)
  VALUES (NEW.project_id, NEW.decision, NEW.reason, NEW.alternatives_considered, NEW.impact, auth.uid(), COALESCE(NEW.decided_at, CURRENT_DATE))
  RETURNING id, created_at INTO NEW.id, NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER insert_decision_view_trigger
INSTEAD OF INSERT ON public.decisions
FOR EACH ROW EXECUTE FUNCTION public.insert_decision_view();

CREATE OR REPLACE FUNCTION public.insert_activity_log_view()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (project_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (NEW.project_id, NEW.user_id, NEW.action, NEW.entity_type, NEW.entity_id, COALESCE(NEW.metadata, '{}'::jsonb))
  RETURNING id, created_at INTO NEW.id, NEW.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER insert_activity_log_view_trigger
INSTEAD OF INSERT ON public.activity_log
FOR EACH ROW EXECUTE FUNCTION public.insert_activity_log_view();

-- Full-text search vector triggers
CREATE OR REPLACE FUNCTION public.update_projects_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.title := coalesce(nullif(trim(NEW.title), ''), NEW.name);
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.technologies, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_assets_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.file_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_content_items_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.research_notes, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.outline, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.script, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_knowledge_entries_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.body, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_priority ON public.projects(priority);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON public.projects(updated_at DESC);
CREATE INDEX idx_projects_search ON public.projects USING GIN(search_vector);
CREATE INDEX idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX idx_milestones_status ON public.milestones(status);
CREATE INDEX idx_assets_project_id ON public.assets(project_id);
CREATE INDEX idx_assets_owner_id ON public.assets(owner_id);
CREATE INDEX idx_assets_uploaded_at ON public.assets(uploaded_at DESC);
CREATE INDEX idx_assets_search ON public.assets USING GIN(search_vector);
CREATE INDEX idx_content_project_id ON public.content_items(project_id);
CREATE INDEX idx_content_status ON public.content_items(status);
CREATE INDEX idx_content_publish_date ON public.content_items(publish_date DESC);
CREATE INDEX idx_content_created_at ON public.content_items(created_at DESC);
CREATE INDEX idx_content_search ON public.content_items USING GIN(search_vector);
CREATE INDEX idx_knowledge_owner_id ON public.knowledge_entries(owner_id);
CREATE INDEX idx_knowledge_project_id ON public.knowledge_entries(project_id);
CREATE INDEX idx_knowledge_category ON public.knowledge_entries(category);
CREATE INDEX idx_knowledge_created_at ON public.knowledge_entries(created_at DESC);
CREATE INDEX idx_knowledge_search ON public.knowledge_entries USING GIN(search_vector);
CREATE INDEX idx_architecture_decisions_project_id ON public.architecture_decisions(project_id);
CREATE INDEX idx_architecture_decisions_created_by ON public.architecture_decisions(created_by);
CREATE INDEX idx_architecture_decisions_created_at ON public.architecture_decisions(created_at DESC);
CREATE INDEX idx_activity_logs_project_id ON public.activity_logs(project_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_weekly_debriefs_user_week ON public.weekly_debriefs(user_id, week_start DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_ai_sessions_user_id ON public.ai_sessions(user_id);
CREATE INDEX idx_ai_sessions_project_id ON public.ai_sessions(project_id);

-- Search vector maintenance triggers
CREATE TRIGGER update_projects_search_vector
BEFORE INSERT OR UPDATE OF name, title, description, technologies ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_projects_search_vector();

CREATE TRIGGER update_assets_search_vector
BEFORE INSERT OR UPDATE OF file_name, description, tags ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.update_assets_search_vector();

CREATE TRIGGER update_content_items_search_vector
BEFORE INSERT OR UPDATE OF title, research_notes, outline, script ON public.content_items
FOR EACH ROW EXECUTE FUNCTION public.update_content_items_search_vector();

CREATE TRIGGER update_knowledge_entries_search_vector
BEFORE INSERT OR UPDATE OF title, body, tags ON public.knowledge_entries
FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_entries_search_vector();

-- Updated-at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_entries_updated_at BEFORE UPDATE ON public.knowledge_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_weekly_debriefs_updated_at BEFORE UPDATE ON public.weekly_debriefs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activity triggers
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (project_id, user_id, activity_type, action, entity_type, entity_id)
  VALUES (
    NEW.id,
    NEW.owner_id,
    CASE WHEN TG_OP = 'INSERT' THEN 'project_created'::public.activity_type ELSE 'project_updated'::public.activity_type END,
    CASE WHEN TG_OP = 'INSERT' THEN 'Project created' ELSE 'Project updated' END,
    'project',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();
CREATE TRIGGER log_project_updated AFTER UPDATE OF name, description, status, priority, progress ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_project_activity();

CREATE OR REPLACE FUNCTION public.log_milestone_completed()
RETURNS TRIGGER AS $$
DECLARE project_owner UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT owner_id INTO project_owner FROM public.projects WHERE id = NEW.project_id;
    INSERT INTO public.activity_logs (project_id, user_id, activity_type, action, entity_type, entity_id)
    VALUES (NEW.project_id, project_owner, 'milestone_completed', 'Milestone completed', 'milestone', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_milestone_completed AFTER UPDATE OF status ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.log_milestone_completed();

-- Signup bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE workspace_id UUID;
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);

  INSERT INTO public.workspaces (owner_id, name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'workspace_name', 'My Workspace'), lower(replace(split_part(NEW.email, '@', 1), '.', '-')))
  RETURNING id INTO workspace_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self_all" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "workspaces_owner_all" ON public.workspaces FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "user_settings_self_all" ON public.user_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_owner_all" ON public.projects FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "milestones_project_owner_all" ON public.milestones FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));
CREATE POLICY "assets_owner_all" ON public.assets FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "content_project_owner_all" ON public.content_items FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()));
CREATE POLICY "knowledge_owner_all" ON public.knowledge_entries FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "architecture_decisions_project_owner_all" ON public.architecture_decisions FOR ALL USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) AND auth.uid() = created_by);
CREATE POLICY "activity_logs_user_all" ON public.activity_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weekly_debriefs_self_all" ON public.weekly_debriefs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_self_all" ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_sessions_self_all" ON public.ai_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-assets', 'project-assets', true),
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('documents', 'documents', false),
  ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_read_public_buckets" ON storage.objects
FOR SELECT USING (bucket_id IN ('project-assets', 'avatars', 'covers', 'assets'));

CREATE POLICY "storage_read_own_documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_insert_own_folder" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('project-assets', 'avatars', 'covers', 'documents', 'assets') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_update_own_folder" ON storage.objects
FOR UPDATE USING (bucket_id IN ('project-assets', 'avatars', 'covers', 'documents', 'assets') AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_delete_own_folder" ON storage.objects
FOR DELETE USING (bucket_id IN ('project-assets', 'avatars', 'covers', 'documents', 'assets') AND auth.uid()::text = (storage.foldername(name))[1]);

NOTIFY pgrst, 'reload schema';
