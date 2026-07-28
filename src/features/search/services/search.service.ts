import { getSupabaseClient } from '@/lib/supabase/client'

export type SearchResult = {
  id: string
  type:
    | 'project'
    | 'knowledge'
    | 'content'
    | 'asset'
    | 'architecture'
    | 'activity'
    | 'weekly'
    | 'setting'
    | 'command'
  title: string
  subtitle?: string
  path: string
}

export async function searchWorkspace(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const supabase = getSupabaseClient()
  const pattern = `%${trimmed}%`

  const [projects, knowledge, content, assets, architecture, activity, weekly] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description')
      .ilike('name', pattern)
      .is('deleted_at', null)
      .limit(5),
    supabase.from('knowledge_entries').select('id, title, category').ilike('title', pattern).limit(5),
    supabase.from('content_items').select('id, title, platform').ilike('title', pattern).limit(5),
    supabase.from('assets').select('id, file_name, asset_type').ilike('file_name', pattern).limit(5),
    supabase
      .from('architecture_decisions')
      .select('id, project_id, decision, impact')
      .ilike('decision', pattern)
      .limit(5),
    supabase
      .from('activity_logs')
      .select('id, project_id, action, entity_type')
      .ilike('action', pattern)
      .limit(5),
    supabase.from('weekly_debriefs').select('id, week_start, wins, lessons').limit(5),
  ])

  for (const response of [projects, knowledge, content, assets, architecture, activity, weekly]) {
    if (response.error) throw response.error
  }

  return [
    ...(projects.data ?? []).map((item) => ({
      id: item.id,
      type: 'project' as const,
      title: item.name,
      subtitle: item.description ?? undefined,
      path: `/projects/${item.id}`,
    })),
    ...(knowledge.data ?? []).map((item) => ({
      id: item.id,
      type: 'knowledge' as const,
      title: item.title,
      subtitle: item.category,
      path: '/knowledge',
    })),
    ...(content.data ?? []).map((item) => ({
      id: item.id,
      type: 'content' as const,
      title: item.title,
      subtitle: item.platform,
      path: '/content',
    })),
    ...(assets.data ?? []).map((item) => ({
      id: item.id,
      type: 'asset' as const,
      title: item.file_name,
      subtitle: item.asset_type,
      path: '/assets',
    })),
    ...(architecture.data ?? []).map((item) => ({
      id: item.id,
      type: 'architecture' as const,
      title: item.decision,
      subtitle: item.impact ?? undefined,
      path: `/projects/${item.project_id}`,
    })),
    ...(activity.data ?? []).map((item) => ({
      id: item.id,
      type: 'activity' as const,
      title: item.action,
      subtitle: item.entity_type,
      path: item.project_id ? `/projects/${item.project_id}` : '/mission-control',
    })),
    ...(weekly.data ?? [])
      .filter((item) =>
        `${item.week_start} ${(item.wins ?? []).join(' ')} ${(item.lessons ?? []).join(' ')}`
          .toLowerCase()
          .includes(trimmed.toLowerCase()),
      )
      .map((item) => ({
        id: item.id,
        type: 'weekly' as const,
        title: `Weekly Review ${item.week_start}`,
        subtitle: [...(item.wins ?? []), ...(item.lessons ?? [])].slice(0, 2).join(' · '),
        path: '/weekly-debrief',
      })),
  ]
}
