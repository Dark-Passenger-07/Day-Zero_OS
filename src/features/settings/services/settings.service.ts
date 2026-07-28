import { getSupabaseClient } from '@/lib/supabase/client'

export async function exportWorkspaceData(): Promise<Record<string, unknown>> {
  const supabase = getSupabaseClient()
  const [projects, knowledge, assets, content, debriefs] = await Promise.all([
    supabase.from('projects').select('*').is('deleted_at', null),
    supabase.from('knowledge_entries').select('*'),
    supabase.from('assets').select('*'),
    supabase.from('content_items').select('*'),
    supabase.from('weekly_debriefs').select('*'),
  ])
  for (const response of [projects, knowledge, assets, content, debriefs])
    if (response.error) throw response.error
  return {
    exportedAt: new Date().toISOString(),
    projects: projects.data,
    knowledge: knowledge.data,
    assets: assets.data,
    content: content.data,
    weeklyDebriefs: debriefs.data,
  }
}

export async function storageUsage(): Promise<{ assets: number; documents: number }> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('assets').select('metadata')
  if (error) throw error
  return {
    assets: data?.length ?? 0,
    documents: data?.filter((item) => String(item.metadata?.type ?? '').includes('document')).length ?? 0,
  }
}

export async function importKnowledgeEntries(
  entries: Array<{ title?: unknown; body?: unknown; category?: unknown; tags?: unknown }>,
  ownerId: string,
): Promise<number> {
  const valid = entries
    .filter((entry) => typeof entry.title === 'string' && entry.title.trim())
    .map((entry) => ({
      owner_id: ownerId,
      title: String(entry.title).trim(),
      body: typeof entry.body === 'string' ? entry.body : null,
      category: ['research', 'lesson', 'framework', 'reference', 'personal-note'].includes(
        String(entry.category),
      )
        ? entry.category
        : 'research',
      tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
    }))

  if (valid.length === 0) return 0
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').insert(valid)
  if (error) throw error
  return valid.length
}
