import { getSupabaseClient } from '@/lib/supabase/client'

export type ContentItem = {
  id: string
  title: string
  platform: string
  status:
    'idea' | 'outline' | 'script' | 'recording' | 'editing' | 'thumbnail' | 'seo' | 'published' | 'analytics'
  publishDate: string | null
  analytics: Record<string, unknown>
  projectName: string
}

type ContentRow = {
  id: string
  title: string
  platform: string
  status: ContentItem['status']
  publish_date: string | null
  analytics: Record<string, unknown>
  project?: { name: string } | { name: string }[] | null
}

function projectName(project: ContentRow['project']) {
  if (Array.isArray(project)) return project[0]?.name ?? 'Unlinked'
  return project?.name ?? 'Unlinked'
}

export async function listContentItems(): Promise<ContentItem[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, platform, status, publish_date, analytics, project:projects(name)')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as unknown as ContentRow[]).map((item) => ({
    id: item.id,
    title: item.title,
    platform: item.platform,
    status: item.status,
    publishDate: item.publish_date,
    analytics: item.analytics ?? {},
    projectName: projectName(item.project),
  }))
}

export async function createContentItem(title: string, platform: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .is('deleted_at', null)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (projectError) throw projectError
  if (!project?.id) {
    throw new Error('Create a project before adding content. Content must belong to a project.')
  }

  const { error } = await supabase.from('content_items').insert({
    project_id: project.id,
    title,
    platform,
    status: 'idea',
  })

  if (error) throw error
}
