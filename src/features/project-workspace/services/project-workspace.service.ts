import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled } from '@/lib/supabase/mockClient'
import type { Priority, ProjectStatus } from '@/types/enums'

export type WorkspaceProject = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: Priority
  progress: number
  deadline: string | null
  technologies: string[]
}

export type WorkspaceMilestone = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'completed'
  priority: Priority
  progress: number
  dueDate: string | null
  estimatedHours: number | null
  completedDate: string | null
  notes: string | null
}

export type WorkspaceDecision = {
  id: string
  problem: string | null
  decision: string
  reason: string | null
  alternatives: string | null
  consequences: string | null
  impact: string | null
  references: string[]
  decidedAt: string
}

export type WorkspaceKnowledge = {
  id: string
  title: string
  body: string | null
  category: 'research' | 'lesson' | 'framework' | 'reference' | 'personal-note'
  tags: string[]
  starred: boolean
  createdAt: string
}

export type WorkspaceAsset = {
  id: string
  name: string
  assetType: 'image' | 'video' | 'pdf' | 'logo' | 'document' | 'link' | 'github' | 'figma' | 'reference'
  fileUrl: string | null
  storagePath: string | null
  tags: string[]
  description: string | null
  notes: string | null
  uploadedAt: string
}

export type WorkspaceContent = {
  id: string
  title: string
  status:
    | 'idea'
    | 'research'
    | 'outline'
    | 'script'
    | 'recording'
    | 'editing'
    | 'thumbnail'
    | 'seo'
    | 'published'
    | 'analytics'
  platform: string
  publishDate: string | null
  researchNotes: string | null
  outline: string | null
  script: string | null
  analytics: Record<string, unknown>
}

export type WorkspaceTask = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in-progress' | 'blocked' | 'done'
  priority: Priority
  estimateHours: number | null
  dueDate: string | null
  dependencies: string[]
  labels: string[]
  notes: string | null
}

export type WorkspaceBug = {
  id: string
  title: string
  description: string | null
  status: 'open' | 'triage' | 'fixing' | 'fixed' | 'closed'
  severity: Priority
  priority: Priority
  stepsToReproduce: string | null
  expectedBehavior: string | null
  actualBehavior: string | null
  resolution: string | null
}

export type WorkspaceDebt = {
  id: string
  title: string
  status: 'open' | 'planned' | 'resolved'
  impact: string | null
  proposedFix: string | null
}

export type WorkspaceRepository = {
  id: string
  name: string
  url: string
  branch: string | null
  notes: string | null
}

export type WorkspaceDevelopmentNote = {
  id: string
  title: string
  body: string | null
  tags: string[]
  autosavedAt: string | null
}

export type WorkspaceActivity = {
  id: string
  action: string
  entityType: string
  createdAt: string
}

export type ProjectWorkspaceData = {
  project: WorkspaceProject
  milestones: WorkspaceMilestone[]
  decisions: WorkspaceDecision[]
  knowledge: WorkspaceKnowledge[]
  assets: WorkspaceAsset[]
  content: WorkspaceContent[]
  tasks: WorkspaceTask[]
  bugs: WorkspaceBug[]
  debt: WorkspaceDebt[]
  repositories: WorkspaceRepository[]
  developmentNotes: WorkspaceDevelopmentNote[]
  activity: WorkspaceActivity[]
}

type ProjectRow = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: Priority
  progress: number
  deadline: string | null
  technologies: string[] | null
}

type ProjectUpdate = Partial<
  Pick<
    WorkspaceProject,
    'name' | 'description' | 'status' | 'priority' | 'progress' | 'deadline' | 'technologies'
  >
>
type WorkspaceRow = Record<string, unknown>

function isSchemaMissing(error: { code?: string; message?: string } | null) {
  return (
    error?.code === 'PGRST205' ||
    error?.code === '42703' ||
    error?.message?.includes('schema cache') ||
    error?.message?.includes('does not exist')
  )
}

export async function fetchProjectWorkspace(projectId: string): Promise<ProjectWorkspaceData> {
  const supabase = getSupabaseClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, description, status, priority, progress, deadline, technologies')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single()
  let { data: milestones, error: milestonesError } = (await supabase
    .from('milestones')
    .select(
      'id, title, description, status, priority, progress, due_date, estimated_hours, completed_date, notes',
    )
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })) as {
    data: WorkspaceRow[] | null
    error: { code?: string; message?: string } | null
  }
  let { data: decisions, error: decisionsError } = (await supabase
    .from('decisions')
    .select(
      'id, problem, decision, reason, alternatives_considered, consequences, impact, reference_links, decided_at',
    )
    .eq('project_id', projectId)
    .order('decided_at', { ascending: false })) as {
    data: WorkspaceRow[] | null
    error: { code?: string; message?: string } | null
  }
  const { data: knowledge, error: knowledgeError } = await supabase
    .from('knowledge_entries')
    .select('id, title, body, category, tags, starred, created_at')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
  let { data: assets, error: assetsError } = (await supabase
    .from('assets')
    .select('id, file_name, asset_type, file_url, storage_path, tags, description, notes, uploaded_at')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })) as {
    data: WorkspaceRow[] | null
    error: { code?: string; message?: string } | null
  }
  const { data: content, error: contentError } = await supabase
    .from('content_items')
    .select('id, title, status, platform, publish_date, research_notes, outline, script, analytics')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
  let { data: tasks, error: tasksError } = (await supabase
    .from('project_tasks')
    .select('id, title, description, status, priority, estimate_hours, due_date, dependencies, labels, notes')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })) as {
    data: WorkspaceRow[] | null
    error: { code?: string; message?: string } | null
  }
  let { data: bugs, error: bugsError } = (await supabase
    .from('project_bugs')
    .select(
      'id, title, description, status, severity, priority, steps_to_reproduce, expected_behavior, actual_behavior, resolution',
    )
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })) as {
    data: WorkspaceRow[] | null
    error: { code?: string; message?: string } | null
  }
  const { data: debt, error: debtError } = await supabase
    .from('technical_debt_items')
    .select('id, title, status, impact, proposed_fix')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
  const { data: repositories, error: repositoriesError } = await supabase
    .from('project_repositories')
    .select('id, name, url, branch, notes')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
  let { data: developmentNotes, error: developmentNotesError } = (await supabase
    .from('development_notes')
    .select('id, title, body, tags, autosaved_at')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })) as {
    data: WorkspaceRow[] | null
    error: { code?: string; message?: string } | null
  }
  const { data: activity, error: activityError } = await supabase
    .from('activity_log')
    .select('id, action, entity_type, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(80)

  if (isSchemaMissing(milestonesError)) {
    const fallback = await supabase
      .from('milestones')
      .select('id, title, status, due_date, completed_date, notes')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
    milestones = fallback.data as WorkspaceRow[] | null
    milestonesError = fallback.error
  }
  if (isSchemaMissing(decisionsError)) {
    const fallback = await supabase
      .from('decisions')
      .select('id, decision, reason, alternatives_considered, impact, decided_at')
      .eq('project_id', projectId)
      .order('decided_at', { ascending: false })
    decisions = fallback.data as WorkspaceRow[] | null
    decisionsError = fallback.error
  }
  if (isSchemaMissing(assetsError)) {
    const fallback = await supabase
      .from('assets')
      .select('id, file_name, asset_type, file_url, storage_path, tags, uploaded_at')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false })
    assets = fallback.data as WorkspaceRow[] | null
    assetsError = fallback.error
  }
  if (isSchemaMissing(tasksError)) {
    const fallback = await supabase
      .from('project_tasks')
      .select('id, title, status, priority, due_date, notes')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
    tasks = fallback.data as WorkspaceRow[] | null
    tasksError = fallback.error
  }
  if (isSchemaMissing(bugsError)) {
    const fallback = await supabase
      .from('project_bugs')
      .select('id, title, status, severity, steps_to_reproduce, resolution')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
    bugs = fallback.data as WorkspaceRow[] | null
    bugsError = fallback.error
  }
  if (isSchemaMissing(developmentNotesError)) {
    const fallback = await supabase
      .from('development_notes')
      .select('id, title, body')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
    developmentNotes = fallback.data as WorkspaceRow[] | null
    developmentNotesError = fallback.error
  }

  if (projectError) throw projectError
  if (milestonesError) throw milestonesError
  if (decisionsError) throw decisionsError
  if (knowledgeError) throw knowledgeError
  if (assetsError) throw assetsError
  if (contentError) throw contentError
  if (tasksError) throw tasksError
  if (bugsError) throw bugsError
  if (debtError) throw debtError
  if (repositoriesError) throw repositoriesError
  if (developmentNotesError) throw developmentNotesError
  if (activityError) throw activityError

  const row = project as ProjectRow

  return {
    project: {
      id: row.id,
      name: row.name,
      description: row.description ?? 'No description',
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      deadline: row.deadline,
      technologies: row.technologies ?? [],
    },
    milestones: ((milestones ?? []) as WorkspaceRow[]).map((item) => ({
      id: String(item.id),
      title: String(item.title),
      description: typeof item.description === 'string' ? item.description : null,
      status: item.status as WorkspaceMilestone['status'],
      priority: (item.priority ?? 'medium') as Priority,
      progress: typeof item.progress === 'number' ? item.progress : item.status === 'completed' ? 100 : 0,
      dueDate: typeof item.due_date === 'string' ? item.due_date : null,
      estimatedHours: typeof item.estimated_hours === 'number' ? item.estimated_hours : null,
      completedDate: typeof item.completed_date === 'string' ? item.completed_date : null,
      notes: typeof item.notes === 'string' ? item.notes : null,
    })),
    decisions: ((decisions ?? []) as WorkspaceRow[]).map((item) => ({
      id: String(item.id),
      problem: typeof item.problem === 'string' ? item.problem : null,
      decision: String(item.decision),
      reason: typeof item.reason === 'string' ? item.reason : null,
      alternatives: typeof item.alternatives_considered === 'string' ? item.alternatives_considered : null,
      consequences: typeof item.consequences === 'string' ? item.consequences : null,
      impact: typeof item.impact === 'string' ? item.impact : null,
      references: Array.isArray(item.reference_links) ? item.reference_links.map(String) : [],
      decidedAt: String(item.decided_at),
    })),
    knowledge: (knowledge ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      category: item.category,
      tags: item.tags ?? [],
      starred: item.starred,
      createdAt: item.created_at,
    })),
    assets: ((assets ?? []) as WorkspaceRow[]).map((item) => ({
      id: String(item.id),
      name: String(item.file_name),
      assetType: item.asset_type as WorkspaceAsset['assetType'],
      fileUrl: typeof item.file_url === 'string' ? item.file_url : null,
      storagePath: typeof item.storage_path === 'string' ? item.storage_path : null,
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      description: typeof item.description === 'string' ? item.description : null,
      notes: typeof item.notes === 'string' ? item.notes : null,
      uploadedAt: String(item.uploaded_at),
    })),
    content: (content ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      platform: item.platform,
      publishDate: item.publish_date,
      researchNotes: item.research_notes,
      outline: item.outline,
      script: item.script,
      analytics: item.analytics ?? {},
    })),
    tasks: ((tasks ?? []) as WorkspaceRow[]).map((item) => ({
      id: String(item.id),
      title: String(item.title),
      description: typeof item.description === 'string' ? item.description : null,
      status: item.status as WorkspaceTask['status'],
      priority: item.priority as Priority,
      estimateHours: typeof item.estimate_hours === 'number' ? item.estimate_hours : null,
      dueDate: typeof item.due_date === 'string' ? item.due_date : null,
      dependencies: Array.isArray(item.dependencies) ? item.dependencies.map(String) : [],
      labels: Array.isArray(item.labels) ? item.labels.map(String) : [],
      notes: typeof item.notes === 'string' ? item.notes : null,
    })),
    bugs: ((bugs ?? []) as WorkspaceRow[]).map((item) => ({
      id: String(item.id),
      title: String(item.title),
      description: typeof item.description === 'string' ? item.description : null,
      status: item.status as WorkspaceBug['status'],
      severity: item.severity as Priority,
      priority: (item.priority ?? item.severity) as Priority,
      stepsToReproduce: typeof item.steps_to_reproduce === 'string' ? item.steps_to_reproduce : null,
      expectedBehavior: typeof item.expected_behavior === 'string' ? item.expected_behavior : null,
      actualBehavior: typeof item.actual_behavior === 'string' ? item.actual_behavior : null,
      resolution: typeof item.resolution === 'string' ? item.resolution : null,
    })),
    debt: (debt ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      impact: item.impact,
      proposedFix: item.proposed_fix,
    })),
    repositories: (repositories ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      branch: item.branch,
      notes: item.notes,
    })),
    developmentNotes: ((developmentNotes ?? []) as WorkspaceRow[]).map((item) => ({
      id: String(item.id),
      title: String(item.title),
      body: typeof item.body === 'string' ? item.body : null,
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      autosavedAt: typeof item.autosaved_at === 'string' ? item.autosaved_at : null,
    })),
    activity: (activity ?? []).map((item) => ({
      id: item.id,
      action: item.action,
      entityType: item.entity_type,
      createdAt: item.created_at,
    })),
  }
}

export async function createTask(
  projectId: string,
  input: {
    title: string
    description?: string | null
    priority?: Priority
    estimate_hours?: number | null
    due_date?: string | null
    dependencies?: string[]
    labels?: string[]
    notes?: string | null
  },
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_tasks').insert({ project_id: projectId, ...input })
  if (error) throw error
}

export async function updateTask(
  id: string,
  updates: Partial<{
    title: string
    description: string | null
    status: WorkspaceTask['status']
    priority: Priority
    estimate_hours: number | null
    due_date: string | null
    dependencies: string[]
    labels: string[]
    notes: string | null
    completed_at: string | null
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_tasks').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createBug(
  projectId: string,
  input: {
    title: string
    description?: string | null
    severity?: Priority
    priority?: Priority
    steps_to_reproduce?: string | null
    expected_behavior?: string | null
    actual_behavior?: string | null
  },
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_bugs').insert({ project_id: projectId, ...input })
  if (error) throw error
}

export async function updateBug(
  id: string,
  updates: Partial<{
    title: string
    description: string | null
    status: WorkspaceBug['status']
    severity: Priority
    priority: Priority
    steps_to_reproduce: string | null
    expected_behavior: string | null
    actual_behavior: string | null
    resolution: string | null
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_bugs').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteBug(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_bugs').delete().eq('id', id)
  if (error) throw error
}

export async function createDebt(projectId: string, title: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('technical_debt_items').insert({ project_id: projectId, title })
  if (error) throw error
}

export async function updateDebt(
  id: string,
  updates: Partial<{
    title: string
    status: WorkspaceDebt['status']
    impact: string | null
    proposed_fix: string | null
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('technical_debt_items').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteDebt(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('technical_debt_items').delete().eq('id', id)
  if (error) throw error
}

export async function createRepository(projectId: string, name: string, url: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_repositories').insert({ project_id: projectId, name, url })
  if (error) throw error
}

export async function updateRepository(
  id: string,
  updates: Partial<{ name: string; url: string; branch: string | null; notes: string | null }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_repositories').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteRepository(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('project_repositories').delete().eq('id', id)
  if (error) throw error
}

export async function createDevelopmentNote(
  projectId: string,
  title: string,
  body: string,
  tags: string[] = [],
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('development_notes')
    .insert({ project_id: projectId, title, body, tags, autosaved_at: new Date().toISOString() })
  if (error) throw error
}

export async function updateDevelopmentNote(
  id: string,
  updates: Partial<{ title: string; body: string | null; tags: string[]; autosaved_at: string }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('development_notes').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteDevelopmentNote(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('development_notes').delete().eq('id', id)
  if (error) throw error
}

export async function updateProject(projectId: string, updates: ProjectUpdate) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('projects').update(updates).eq('id', projectId)
  if (error) throw error
}

export async function deleteProject(projectId: string) {
  const supabase = getSupabaseClient()

  if (isDemoModeEnabled()) {
    // 1. Fetch assets to clean up storage files / asset versions in mock client
    const { data: assets } = await supabase.from('assets').select('id').eq('project_id', projectId)
    if (assets && assets.length > 0) {
      const assetIds = assets.map((a) => a.id)
      for (const assetId of assetIds) {
        await supabase.from('asset_versions').delete().eq('asset_id', assetId)
      }
    }

    // 2. Delete all child tables (using upgraded mock delete query builder)
    await supabase.from('milestones').delete().eq('project_id', projectId)
    await supabase.from('project_tasks').delete().eq('project_id', projectId)
    await supabase.from('project_bugs').delete().eq('project_id', projectId)
    await supabase.from('technical_debt_items').delete().eq('project_id', projectId)
    await supabase.from('project_repositories').delete().eq('project_id', projectId)
    await supabase.from('development_notes').delete().eq('project_id', projectId)
    await supabase.from('assets').delete().eq('project_id', projectId)
    await supabase.from('content_items').delete().eq('project_id', projectId)
    await supabase.from('architecture_decisions').delete().eq('project_id', projectId)
    await supabase.from('activity_log').delete().eq('project_id', projectId)
    await supabase.from('activity_logs').delete().eq('project_id', projectId)
    await supabase.from('notifications').delete().eq('project_id', projectId)
    await supabase.from('ai_sessions').delete().eq('project_id', projectId)

    // 3. Set project_id to NULL on knowledge_entries (ON DELETE SET NULL equivalent)
    await supabase.from('knowledge_entries').update({ project_id: null }).eq('project_id', projectId)
  }

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw error
}

export async function createMilestone(
  projectId: string,
  input: {
    title: string
    description?: string | null
    due_date?: string | null
    priority?: Priority
    estimated_hours?: number | null
    notes?: string | null
  },
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('milestones').insert({ project_id: projectId, ...input })
  if (error) throw error
}

export async function updateMilestone(
  id: string,
  updates: Partial<{
    title: string
    description: string | null
    status: WorkspaceMilestone['status']
    priority: Priority
    progress: number
    due_date: string | null
    estimated_hours: number | null
    notes: string | null
    completed_date: string | null
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('milestones').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteMilestone(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('milestones').delete().eq('id', id)
  if (error) throw error
}

export async function createDecision(input: {
  projectId: string
  userId: string
  decision: string
  reason?: string
  alternatives?: string
  impact?: string
}) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('decisions')
    .insert({
      project_id: input.projectId,
      decision: input.decision,
      reason: input.reason ?? null,
      alternatives_considered: input.alternatives ?? null,
      impact: input.impact ?? null,
    })
    .select('id')
    .single()

  if (error) throw error

  await supabase.from('activity_log').insert({
    project_id: input.projectId,
    user_id: input.userId,
    action: `Recorded decision "${input.decision}"`,
    entity_type: 'decision',
    entity_id: data.id,
  })
}

export async function updateDecision(
  id: string,
  updates: Partial<{
    problem: string | null
    decision: string
    reason: string | null
    alternatives_considered: string | null
    consequences: string | null
    impact: string | null
    reference_links: string[]
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('decisions').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteDecision(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('architecture_decisions').delete().eq('id', id)
  if (error) throw error
}

export async function createContent(projectId: string, title: string, platform: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('content_items')
    .insert({ project_id: projectId, title, platform, status: 'idea' })
  if (error) throw error
}

export async function updateContent(
  id: string,
  updates: Partial<{
    title: string
    platform: string
    status: WorkspaceContent['status']
    research_notes: string | null
    outline: string | null
    script: string | null
    publish_date: string | null
    analytics: Record<string, unknown>
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('content_items').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteContent(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('content_items').delete().eq('id', id)
  if (error) throw error
}

export async function createKnowledgeEntry(input: {
  projectId: string
  ownerId: string
  title: string
  body?: string
  category?: WorkspaceKnowledge['category']
  tags?: string[]
}) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').insert({
    project_id: input.projectId,
    owner_id: input.ownerId,
    title: input.title,
    body: input.body ?? null,
    category: input.category ?? 'research',
    tags: input.tags ?? [],
  })
  if (error) throw error
}

export async function updateKnowledgeEntry(
  id: string,
  updates: Partial<{
    title: string
    body: string | null
    category: WorkspaceKnowledge['category']
    tags: string[]
    starred: boolean
  }>,
) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteKnowledgeEntry(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('knowledge_entries').delete().eq('id', id)
  if (error) throw error
}

export async function createProjectAssetLink(input: {
  projectId: string
  ownerId: string
  name: string
  url: string
}) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('assets').insert({
    project_id: input.projectId,
    owner_id: input.ownerId,
    asset_type: 'link',
    file_name: input.name,
    file_url: input.url,
    external_url: input.url,
    tags: ['link'],
  })
  if (error) throw error
}

export async function uploadProjectAsset(input: { projectId: string; ownerId: string; file: File }) {
  const supabase = getSupabaseClient()
  const storagePath = `${input.ownerId}/${input.projectId}/${crypto.randomUUID()}-${input.file.name}`
  const { error: uploadError } = await supabase.storage
    .from('project-assets')
    .upload(storagePath, input.file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('project-assets').getPublicUrl(storagePath)
  const assetType = input.file.type.startsWith('image/')
    ? 'image'
    : input.file.type.startsWith('video/')
      ? 'video'
      : input.file.type === 'application/pdf'
        ? 'pdf'
        : 'document'
  const { error } = await supabase.from('assets').insert({
    project_id: input.projectId,
    owner_id: input.ownerId,
    asset_type: assetType,
    file_name: input.file.name,
    file_url: data.publicUrl,
    storage_bucket: 'project-assets',
    storage_path: storagePath,
    metadata: { size: input.file.size, type: input.file.type },
  })
  if (error) throw error
}

export async function deleteProjectAsset(asset: WorkspaceAsset) {
  const supabase = getSupabaseClient()
  if (asset.storagePath) {
    await supabase.storage.from('project-assets').remove([asset.storagePath])
  }
  const { error } = await supabase.from('assets').delete().eq('id', asset.id)
  if (error) throw error
}
