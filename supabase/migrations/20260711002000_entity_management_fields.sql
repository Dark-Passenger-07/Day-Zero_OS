-- Day Zero OS V1.0 - Complete entity management fields

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS priority public.priority_level NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(8,2);

ALTER TABLE public.project_tasks
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS estimate_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS dependencies TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS labels TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.project_bugs
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS priority public.priority_level NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS expected_behavior TEXT,
  ADD COLUMN IF NOT EXISTS actual_behavior TEXT,
  ADD COLUMN IF NOT EXISTS attachment_asset_ids UUID[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_task_ids UUID[] NOT NULL DEFAULT '{}';

ALTER TABLE public.development_notes
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS autosaved_at TIMESTAMPTZ;

ALTER TABLE public.architecture_decisions
  ADD COLUMN IF NOT EXISTS problem TEXT,
  ADD COLUMN IF NOT EXISTS consequences TEXT,
  ADD COLUMN IF NOT EXISTS reference_links TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_project_tasks_labels ON public.project_tasks USING GIN(labels);
CREATE INDEX IF NOT EXISTS idx_development_notes_tags ON public.development_notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_architecture_decisions_reference_links ON public.architecture_decisions USING GIN(reference_links);

NOTIFY pgrst, 'reload schema';
