import { getSupabaseClient } from '@/lib/supabase/client'
import type { Priority, ProjectStatus } from '@/types/enums'

export type ProjectListItem = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  deadline: string
  technologies: string[]
  priority: Priority
  createdAt: string
}

type ProjectRow = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  progress: number
  deadline: string | null
  technologies: string[] | null
  priority: Priority
  created_at: string
}

async function resolveWorkspaceId(ownerId: string): Promise<string> {
  const supabase = getSupabaseClient()

  const { data: existing, error: existingError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing?.id) return existing.id

  const { data: created, error: createError } = await supabase
    .from('workspaces')
    .insert({
      owner_id: ownerId,
      name: 'My Workspace',
    })
    .select('id')
    .single()

  if (createError) throw createError
  return created.id
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return 'No deadline'

  return new Date(`${deadline}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function mapProject(row: ProjectRow): ProjectListItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? 'No description',
    status: row.status,
    progress: row.progress,
    deadline: formatDeadline(row.deadline),
    technologies: row.technologies ?? [],
    priority: row.priority,
    createdAt: row.created_at,
  }
}

export async function listProjects(includeArchived = false): Promise<ProjectListItem[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('projects')
    .select('id, name, description, status, progress, deadline, technologies, priority, created_at')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (!includeArchived) query = query.neq('status', 'archived')
  const { data, error } = await query
  if (error) throw error

  return ((data ?? []) as ProjectRow[]).map(mapProject)
}

export async function createProject(input: {
  ownerId: string
  name: string
  description?: string
}): Promise<ProjectListItem> {
  const supabase = getSupabaseClient()
  const workspaceId = await resolveWorkspaceId(input.ownerId)

  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: input.ownerId,
      workspace_id: workspaceId,
      name: input.name,
      description: input.description ?? null,
      status: 'active',
      priority: 'medium',
      progress: 0,
    })
    .select('id, name, description, status, progress, deadline, technologies, priority, created_at')
    .single()

  if (error) throw error

  await supabase.from('activity_log').insert({
    project_id: data.id,
    user_id: input.ownerId,
    action: `Created project "${data.name}"`,
    entity_type: 'project',
    entity_id: data.id,
  })

  return mapProject(data as ProjectRow)
}

export async function archiveProject(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('projects').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function restoreProject(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('projects').update({ status: 'active', archived_at: null }).eq('id', id)
  if (error) throw error
}

export async function duplicateProject(ownerId: string, source: ProjectListItem): Promise<ProjectListItem> {
  return createProject({
    ownerId,
    name: `${source.name} Copy`,
    description: source.description,
  })
}
