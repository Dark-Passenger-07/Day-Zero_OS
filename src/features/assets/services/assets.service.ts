import { getSupabaseClient } from '@/lib/supabase/client'
import { requireWorkspaceId } from '@/features/workspace/services/workspace-helpers'

export type AssetItem = {
  id: string
  name: string
  assetType: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
  fileUrl: string | null
  storagePath: string | null
  tags: string[]
  uploadedAt: string
  metadata: Record<string, unknown>
  versions: number
}

export async function listAssets(workspaceId?: string): Promise<AssetItem[]> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('assets')
    .select(
      'id, file_name, asset_type, file_url, storage_path, tags, uploaded_at, metadata, versions:asset_versions(id)',
    )
    .eq('workspace_id', targetWorkspaceId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.file_name,
    assetType: item.asset_type,
    fileUrl: item.file_url,
    storagePath: item.storage_path,
    tags: item.tags ?? [],
    uploadedAt: item.uploaded_at,
    metadata: item.metadata ?? {},
    versions: Array.isArray(item.versions) ? item.versions.length : 0,
  }))
}

export async function renameAsset(id: string, name: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('assets').update({ file_name: name }).eq('id', id)
  if (error) throw error
}

export async function deleteAsset(asset: AssetItem): Promise<void> {
  const supabase = getSupabaseClient()
  if (asset.storagePath) await supabase.storage.from('assets').remove([asset.storagePath])
  const { error } = await supabase.from('assets').delete().eq('id', asset.id)
  if (error) throw error
}

export async function uploadAssetVersion(ownerId: string, asset: AssetItem, file: File): Promise<void> {
  const supabase = getSupabaseClient()
  const nextVersion = asset.versions + 1
  const storagePath = `${ownerId}/versions/${asset.id}/${nextVersion}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('assets')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('assets').getPublicUrl(storagePath)
  const metadata = { size: file.size, type: file.type }
  const { error: versionError } = await supabase.from('asset_versions').insert({
    asset_id: asset.id,
    owner_id: ownerId,
    version_number: nextVersion,
    file_name: file.name,
    file_url: data.publicUrl,
    storage_path: storagePath,
    metadata,
  })
  if (versionError) throw versionError
  const { error } = await supabase
    .from('assets')
    .update({ file_name: file.name, file_url: data.publicUrl, storage_path: storagePath, metadata })
    .eq('id', asset.id)
  if (error) throw error
}

export async function createAssetLink(
  ownerId: string,
  name: string,
  url: string,
  workspaceId?: string,
): Promise<void> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('assets').insert({
    owner_id: ownerId,
    workspace_id: targetWorkspaceId,
    asset_type: 'link',
    file_name: name,
    file_url: url,
    tags: ['link'],
  })

  if (error) throw error
}

export async function uploadAssetFile(ownerId: string, file: File, workspaceId?: string): Promise<void> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const storagePath = `${targetWorkspaceId}/${crypto.randomUUID()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('assets').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('assets').getPublicUrl(storagePath)
  const assetType = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : file.type === 'application/pdf'
        ? 'pdf'
        : 'document'

  const { error } = await supabase.from('assets').insert({
    owner_id: ownerId,
    workspace_id: targetWorkspaceId,
    asset_type: assetType,
    file_name: file.name,
    file_url: data.publicUrl,
    storage_path: storagePath,
    tags: [],
    metadata: { size: file.size, type: file.type },
  })

  if (error) throw error
}
