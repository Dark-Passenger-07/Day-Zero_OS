import { getSupabaseClient } from '@/lib/supabase/client'

export type WeeklyDebriefRecord = {
  id: string
  weekStart: string
  weekEnd: string
  wins: string[]
  challenges: string[]
  lessons: string[]
  aiDiscoveries: string[]
  nextWeekGoals: string[]
  metrics: Record<string, unknown>
}

type WeeklyDebriefRow = {
  id: string
  week_start: string
  week_end: string
  wins: string[] | null
  challenges: string[] | null
  lessons: string[] | null
  ai_discoveries: string[] | null
  next_week_goals: string[] | null
  metrics: Record<string, unknown> | null
}

function toRecord(row: WeeklyDebriefRow): WeeklyDebriefRecord {
  return {
    id: row.id,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    wins: row.wins ?? [],
    challenges: row.challenges ?? [],
    lessons: row.lessons ?? [],
    aiDiscoveries: row.ai_discoveries ?? [],
    nextWeekGoals: row.next_week_goals ?? [],
    metrics: row.metrics ?? {},
  }
}

export function currentWeekRange(now = new Date()) {
  const date = new Date(now)
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diffToMonday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    weekStart: start.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
  }
}

export async function listWeeklyDebriefs(): Promise<WeeklyDebriefRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('weekly_debriefs')
    .select('id, week_start, week_end, wins, challenges, lessons, ai_discoveries, next_week_goals, metrics')
    .order('week_start', { ascending: false })

  if (error) throw error

  return ((data ?? []) as WeeklyDebriefRow[]).map(toRecord)
}

export async function createWeeklyDebrief(userId: string): Promise<WeeklyDebriefRecord> {
  const supabase = getSupabaseClient()
  const { weekStart, weekEnd } = currentWeekRange()
  const { data, error } = await supabase
    .from('weekly_debriefs')
    .insert({
      user_id: userId,
      week_start: weekStart,
      week_end: weekEnd,
      wins: [],
      challenges: [],
      lessons: [],
      ai_discoveries: [],
      next_week_goals: [],
      metrics: {},
    })
    .select('id, week_start, week_end, wins, challenges, lessons, ai_discoveries, next_week_goals, metrics')
    .single()

  if (error) throw error
  return toRecord(data as WeeklyDebriefRow)
}

export async function addDebriefEntry(
  debrief: WeeklyDebriefRecord,
  field: 'wins' | 'challenges' | 'lessons' | 'ai_discoveries' | 'next_week_goals',
  value: string,
): Promise<WeeklyDebriefRecord> {
  const supabase = getSupabaseClient()
  const current =
    field === 'wins'
      ? debrief.wins
      : field === 'challenges'
        ? debrief.challenges
        : field === 'lessons'
          ? debrief.lessons
          : field === 'ai_discoveries'
            ? debrief.aiDiscoveries
            : debrief.nextWeekGoals

  const { data, error } = await supabase
    .from('weekly_debriefs')
    .update({ [field]: [...current, value] })
    .eq('id', debrief.id)
    .select('id, week_start, week_end, wins, challenges, lessons, ai_discoveries, next_week_goals, metrics')
    .single()

  if (error) throw error
  return toRecord(data as WeeklyDebriefRow)
}
