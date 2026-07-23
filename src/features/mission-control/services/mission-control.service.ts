import { getSupabaseClient } from '@/lib/supabase/client'

export type UpcomingDeadline = {
  name: string
  project: string
  date: string
  urgent: boolean
}

export type RecentActivity = {
  text: string
  project: string
  time: string
  iconType: string
}

export type RecentNote = {
  title: string
  tag: string
}

export type DashboardData = {
  activeProjectsCount: number
  deadlinesCount: number
  upcomingDeadlines: UpcomingDeadline[]
  recentActivities: RecentActivity[]
  recentKnowledge: RecentNote[]
  weeklyProgress: {
    tasksDone: number
    tasksMax: number
    commitsDone: number
    commitsMax: number
    notesDone: number
    notesMax: number
  }
  todayMission: {
    title: string
    focus: string
    deadline: string
  }
  currentSprint: {
    title: string
    status: string
    progress: number
  } | null
}


type ActivityRow = {
  action: string
  created_at: string
  project?: { name: string } | { name: string }[] | null
}

type KnowledgeRow = {
  title: string
  tags: string[] | null
}

function getProjectName(project: any) {
  if (Array.isArray(project)) return project[0]?.name
  return project?.name
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseClient()

  // 1. Fetch active projects count
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status')
    .is('deleted_at', null)
    .neq('status', 'archived')

  const activeProjectsCount = (projects || []).length

  // 2. Fetch upcoming deadlines (both Milestones and Tasks)
  const { data: upcomingMilestones } = await supabase
    .from('milestones')
    .select('title, due_date, project:projects(name)')
    .neq('status', 'completed')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })
    .limit(3)

  const { data: upcomingTasks } = await supabase
    .from('project_tasks')
    .select('title, due_date, project:projects(name)')
    .neq('status', 'done')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })
    .limit(3)

  const allDeadlines = [
    ...(upcomingMilestones || []).map(m => ({
      name: `[Milestone] ${m.title}`,
      project: getProjectName(m.project) || 'General',
      due: m.due_date as string,
    })),
    ...(upcomingTasks || []).map(t => ({
      name: `[Task] ${t.title}`,
      project: getProjectName(t.project) || 'General',
      due: t.due_date as string,
    })),
  ]

  allDeadlines.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())

  const upcomingDeadlines: UpcomingDeadline[] = allDeadlines.slice(0, 3).map(item => {
    const dueDate = new Date(item.due)
    const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const dateStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    return {
      name: item.name,
      project: item.project,
      date: dateStr,
      urgent: diffDays >= 0 && diffDays <= 3,
    }
  })

  // 3. Fetch recent activities
  const { data: logs } = await supabase
    .from('activity_log')
    .select('id, action, created_at, project:projects(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentActivities: RecentActivity[] = ((logs || []) as unknown as ActivityRow[]).map(l => {
    const createdDate = new Date(l.created_at)
    const diffHours = Math.round((Date.now() - createdDate.getTime()) / (1000 * 60 * 60))
    let timeStr = 'Just now'
    if (diffHours >= 24) {
      timeStr = `${Math.floor(diffHours / 24)}d ago`
    } else if (diffHours > 0) {
      timeStr = `${diffHours}h ago`
    }

    return {
      text: l.action,
      project: getProjectName(l.project) || 'System',
      time: timeStr,
      iconType: l.action.toLowerCase().includes('complete') ? 'check' : 'edit',
    }
  })

  // 4. Fetch recent knowledge
  const { data: knowledge } = await supabase
    .from('knowledge_entries')
    .select('title, tags')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentKnowledge: RecentNote[] = ((knowledge || []) as KnowledgeRow[]).map(k => ({
    title: k.title,
    tag: k.tags && k.tags.length > 0 ? k.tags[0] : 'General',
  }))

  // 5. Fetch weekly progress metrics
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

  const { count: weeklyCompletedCount } = await supabase
    .from('milestones')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_date', startOfWeekStr)

  const { count: weeklyTotalCount } = await supabase
    .from('milestones')
    .select('*', { count: 'exact', head: true })
    .gte('due_date', startOfWeekStr)

  // 6. Get today's top-priority action (highest priority incomplete task, or milestone, or fallback)
  const { data: topPriorityTask } = await supabase
    .from('project_tasks')
    .select('title, priority, due_date, project:projects(name)')
    .neq('status', 'done')
    .order('priority', { ascending: false })
    .limit(1)

  let todayMission = {
    title: 'Start a new project workspace',
    focus: 'Review your product roadmap and plan Sprint 1',
    deadline: 'Today',
  }

  if (topPriorityTask && topPriorityTask.length > 0) {
    todayMission = {
      title: topPriorityTask[0].title,
      focus: `Priority: ${topPriorityTask[0].priority.toUpperCase()} · Project: ${getProjectName(topPriorityTask[0].project) || 'General'}`,
      deadline: topPriorityTask[0].due_date ? `Due: ${topPriorityTask[0].due_date}` : 'Action Required',
    }
  } else if (upcomingMilestones && upcomingMilestones.length > 0) {
    todayMission = {
      title: upcomingMilestones[0].title,
      focus: `Milestone · Project: ${getProjectName(upcomingMilestones[0].project) || 'General'}`,
      deadline: upcomingMilestones[0].due_date ? `Due: ${upcomingMilestones[0].due_date}` : 'Urgent',
    }
  }

  // 7. Get current sprint dynamically based on Milestones
  let currentSprint: DashboardData['currentSprint'] = null
  const { data: activeSprint } = await supabase
    .from('milestones')
    .select('title, status, progress')
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(1)

  if (activeSprint && activeSprint.length > 0) {
    currentSprint = {
      title: activeSprint[0].title,
      status: activeSprint[0].status === 'in-progress' ? 'Active Sprint' : 'Planned Sprint',
      progress: activeSprint[0].progress || 0,
    }
  } else {
    const { data: lastCompleted } = await supabase
      .from('milestones')
      .select('title, status, progress')
      .eq('status', 'completed')
      .order('completed_date', { ascending: false })
      .limit(1)

    if (lastCompleted && lastCompleted.length > 0) {
      currentSprint = {
        title: lastCompleted[0].title,
        status: 'Completed Sprint',
        progress: 100,
      }
    }
  }

  return {
    activeProjectsCount,
    deadlinesCount: upcomingDeadlines.filter(d => d.urgent).length,
    upcomingDeadlines,
    recentActivities,
    recentKnowledge,
    weeklyProgress: {
      tasksDone: Number(weeklyCompletedCount || 0),
      tasksMax: Math.max(Number(weeklyTotalCount || 0), 5),
      commitsDone: 0,
      commitsMax: 10,
      notesDone: recentKnowledge.length,
      notesMax: 5,
    },
    todayMission,
    currentSprint,
  }
}
