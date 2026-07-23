-- Day Zero OS V1.0 - Asset version history

CREATE TABLE public.asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT asset_versions_unique_number UNIQUE (asset_id, version_number)
);

CREATE INDEX idx_asset_versions_asset_id ON public.asset_versions(asset_id);
CREATE INDEX idx_asset_versions_owner_id ON public.asset_versions(owner_id);
CREATE INDEX idx_asset_versions_created_at ON public.asset_versions(created_at DESC);

ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_versions_owner_all" ON public.asset_versions
FOR ALL USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.create_asset_initial_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.asset_versions (asset_id, owner_id, version_number, file_name, file_url, storage_path, metadata)
  VALUES (NEW.id, NEW.owner_id, 1, NEW.file_name, NEW.file_url, NEW.storage_path, NEW.metadata);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_asset_initial_version
AFTER INSERT ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.create_asset_initial_version();

NOTIFY pgrst, 'reload schema';
