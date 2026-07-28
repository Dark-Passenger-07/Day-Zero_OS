import { getSupabaseClient } from '@/lib/supabase/client'

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

export async function listKnowledge(): Promise<KnowledgeEntry[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('id, title, body, category, tags, source, starred, created_at')
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
  title: string
  body?: string
  category?: KnowledgeEntry['category']
}) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').insert({
    owner_id: input.ownerId,
    title: input.title,
    body: input.body ?? '',
    category: input.category ?? 'personal-note',
  })

  if (error) throw error
}
