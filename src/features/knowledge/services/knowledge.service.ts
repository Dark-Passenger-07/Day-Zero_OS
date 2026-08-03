import { getSupabaseClient } from '@/lib/supabase/client'
import { requireWorkspaceId } from '@/features/workspace/services/workspace-helpers'

export type KnowledgeEntry = {
  id: string
  title: string
  body: string
  category: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
  tags: string[]
  source: string | null
  starred: boolean
  createdAt: string
}

export async function listKnowledge(workspaceId?: string): Promise<KnowledgeEntry[]> {
  const targetWorkspaceId = requireWorkspaceId(workspaceId)
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('id, title, body, category, tags, source, starred, created_at')
    .eq('workspace_id', targetWorkspaceId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body ?? '',
    category: item.category,
    tags: item.tags ?? [],
    source: item.source,
    starred: item.starred,
    createdAt: item.created_at,
  }))
}

export async function createKnowledgeEntry(input: {
  ownerId: string
  workspaceId?: string
  title: string
  body?: string
  category?: KnowledgeEntry['category']
}) {
  const targetWorkspaceId = requireWorkspaceId(input.workspaceId)
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').insert({
    owner_id: input.ownerId,
    workspace_id: targetWorkspaceId,
    title: input.title,
    body: input.body ?? '',
    category: input.category ?? 'personal-note',
  })

  if (error) throw error
}
