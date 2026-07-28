import type { Session, User } from '@supabase/supabase-js'

// Simple check to see if we are in demo mode
export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('day_zero_os_demo_mode') === 'true'
}

export function setDemoModeEnabled(enabled: boolean) {
  localStorage.setItem('day_zero_os_demo_mode', enabled ? 'true' : 'false')
}

const DEFAULT_PROFILE = {
  id: 'mock-user-id',
  full_name: 'Aravindhnani',
  username: 'aravindhnani',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  timezone: 'UTC',
  workspace_name: 'Builder Workspace',
}

const DEFAULT_SETTINGS = {
  user_id: 'mock-user-id',
  theme: 'light',
  accent_color: 'blue',
  sidebar_layout: 'default',
  default_project_view: 'table',
  notifications: { email: true, push: false },
  ai_enabled: true,
  ai_provider: 'openai',
  language: 'en',
}

const INITIAL_DATA: Record<string, any[]> = {
  profiles: [DEFAULT_PROFILE],
  user_settings: [DEFAULT_SETTINGS],
  projects: [
    {
      id: 'proj-1',
      name: 'Day Zero OS',
      description:
        'Building the ultimate project-centric operating system for developers, hackers, and creators.',
      status: 'active',
      priority: 'high',
      progress: 68,
      deadline: '2026-08-30',
      technologies: ['React', 'TypeScript', 'Vite', 'TailwindCSS'],
      deleted_at: null,
      created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'proj-2',
      name: 'Veloce AI',
      description: 'AI-assisted code translation engine from Legacy Fortran to Modern Rust.',
      status: 'in-progress',
      priority: 'critical',
      progress: 42,
      deadline: '2026-09-15',
      technologies: ['Rust', 'Python', 'LLMs', 'WebAssembly'],
      deleted_at: null,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  milestones: [
    {
      id: 'ms-1',
      project_id: 'proj-1',
      title: 'V1.0 UI Mockups',
      description: 'Complete standard layout components',
      status: 'completed',
      priority: 'high',
      progress: 100,
      due_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      completed_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      estimated_hours: 15,
      notes: 'Finished ahead of schedule',
      sort_order: 1,
      created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ms-2',
      project_id: 'proj-1',
      title: 'Database Schema Setup',
      description: 'Deploy migrations to Supabase',
      status: 'completed',
      priority: 'high',
      progress: 100,
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      completed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      estimated_hours: 6,
      notes: 'Standard Supabase migrations',
      sort_order: 2,
      created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ms-3',
      project_id: 'proj-1',
      title: 'Auth Flow & Layouts',
      description: 'Integrate session management & workspace shell',
      status: 'in-progress',
      priority: 'high',
      progress: 40,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      completed_date: null,
      estimated_hours: 12,
      notes: 'Debugging fetch and import errors',
      sort_order: 3,
      created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  decisions: [
    {
      id: 'dec-1',
      project_id: 'proj-1',
      problem: 'Styling engine choice',
      decision: 'Use Tailwind CSS v4',
      reason: 'Better compilation speed and simpler configuration.',
      alternatives_considered: 'Vanilla CSS, CSS Modules, Tailwind v3',
      consequences: 'Requires vite-plugin-tailwindcss integration.',
      impact: 'Simplifies utility classes and improves load speed.',
      reference_links: ['https://tailwindcss.com'],
      decided_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  knowledge_entries: [
    {
      id: 'kn-1',
      project_id: 'proj-1',
      title: 'Postgrest Query Builder Patterns',
      body: 'Always typecast the returning payload properties. Supabase JS yields plain JSON records which might not align with custom frontend types.\n\nExample:\n`const status = values.status as ProjectStatus;`',
      category: 'research',
      tags: ['database', 'web-dev', 'typescript'],
      starred: true,
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  assets: [
    {
      id: 'as-1',
      project_id: 'proj-1',
      file_name: 'figma_workspace_v1.png',
      asset_type: 'image',
      file_url:
        'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=400&q=80',
      storage_path: 'mock/figma_workspace_v1.png',
      tags: ['design', 'figma'],
      description: 'Initial design wireframes and mockups.',
      notes: 'Approved by team.',
      uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  content_items: [
    {
      id: 'co-1',
      project_id: 'proj-1',
      title: 'Why Traditional Project Management Fails Builders',
      status: 'outline',
      platform: 'YouTube',
      publish_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      research_notes: 'Builders think in terms of output and context, not just tasks.',
      outline: '1. Introduction\n2. The Task Trap\n3. The Operating System Mental Model\n4. Code Walkthrough',
      script: 'Hook: Stop treating your projects like shopping lists...',
      analytics: { views: 0 },
    },
  ],
  project_tasks: [
    {
      id: 'ts-1',
      project_id: 'proj-1',
      title: 'Fix React router type definitions',
      description: 'Upgrade @types/react-router-dom or declare fallbacks',
      status: 'done',
      priority: 'high',
      estimate_hours: 2,
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      dependencies: [],
      labels: ['bug', 'typescript'],
      notes: 'Completed successfully',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ts-2',
      project_id: 'proj-1',
      title: 'Implement Mock Client Demo Mode',
      description: 'Intercept API calls when Supabase endpoint is unreachable',
      status: 'in-progress',
      priority: 'critical',
      estimate_hours: 3,
      due_date: new Date().toISOString().slice(0, 10),
      dependencies: [],
      labels: ['feature', 'offline-mode'],
      notes: 'Uses LocalStorage proxying',
      updated_at: new Date().toISOString(),
    },
  ],
  project_bugs: [
    {
      id: 'bg-1',
      project_id: 'proj-1',
      title: 'Failed to fetch throws raw unhandled exception on Login',
      description: 'When remote DB is offline, auth throws unhandled net error.',
      status: 'fixing',
      severity: 'high',
      priority: 'critical',
      steps_to_reproduce: 'Disconnect internet or use wrong supabase URL.',
      expected_behavior: 'App falls back gracefully or reports error with fallback button.',
      actual_behavior: 'Loops on loading or crashes.',
      resolution: null,
      updated_at: new Date().toISOString(),
    },
  ],
  technical_debt_items: [
    {
      id: 'td-1',
      project_id: 'proj-1',
      title: 'Refactor custom CSS styles to Tailwind variables',
      status: 'open',
      impact: 'Reduces styling conflicts',
      proposed_fix: 'Migrate custom inline styles to Tailwind v4 class names.',
      updated_at: new Date().toISOString(),
    },
  ],
  project_repositories: [
    {
      id: 'rp-1',
      project_id: 'proj-1',
      name: 'day-zero-os',
      url: 'https://github.com/builder/day-zero-os',
      branch: 'main',
      notes: 'Monorepo containing React app and migrations.',
      updated_at: new Date().toISOString(),
    },
  ],
  development_notes: [
    {
      id: 'dn-1',
      project_id: 'proj-1',
      title: 'Demo Mode Implementation Details',
      body: 'This app is fully interactive when using the Mock Database. Changes are written directly to LocalStorage so they will persist across page refreshes.',
      tags: ['documentation', 'offline'],
      autosaved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  activity_log: [
    {
      id: 'act-1',
      project_id: 'proj-1',
      action: 'Completed Milestone: V1.0 UI Mockups',
      entity_type: 'milestone',
      entity_id: 'ms-1',
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-2',
      project_id: 'proj-1',
      action: 'Completed Milestone: Database Schema Setup',
      entity_type: 'milestone',
      entity_id: 'ms-2',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-3',
      project_id: 'proj-1',
      action: 'Created task "Implement Mock Client Demo Mode"',
      entity_type: 'task',
      entity_id: 'ts-2',
      created_at: new Date().toISOString(),
    },
  ],
  weekly_reviews: [
    {
      id: 'wr-1',
      week_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      wins: 'Setup Vite project + configured base layout structures.',
      mistakes: 'Spent too much time adjusting border colors early on.',
      lessons: 'Focus on working state logic first, then style details.',
      time_wasted: '3 hours',
      automation_ideas: 'Generate new workspace milestones automatically.',
      next_week_priorities: 'Implement client dashboard and assets upload mocks.',
      completed_projects_count: 0,
      published_videos_count: 0,
      created_at: new Date().toISOString(),
    },
  ],
}

function getStoredData(): Record<string, any[]> {
  const dataStr = localStorage.getItem('day_zero_os_mock_db')
  if (!dataStr) {
    localStorage.setItem('day_zero_os_mock_db', JSON.stringify(INITIAL_DATA))
    return INITIAL_DATA
  }
  try {
    return JSON.parse(dataStr)
  } catch {
    return INITIAL_DATA
  }
}

function saveStoredData(data: Record<string, any[]>) {
  localStorage.setItem('day_zero_os_mock_db', JSON.stringify(data))
}

const authCallbacks = new Set<(event: string, session: Session | null) => void>()

export const mockSupabase = {
  auth: {
    async getSession() {
      const isAuthed = localStorage.getItem('day_zero_os_mock_auth') === 'true'
      if (!isAuthed) return { data: { session: null }, error: null }

      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'mock-user-id',
          email: localStorage.getItem('day_zero_os_mock_email') || 'builder@dayzero.dev',
        } as User,
      } as Session

      return { data: { session: mockSession }, error: null }
    },

    async signInWithPassword({ email }: { email: string }) {
      localStorage.setItem('day_zero_os_mock_auth', 'true')
      localStorage.setItem('day_zero_os_mock_email', email)

      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: { id: 'mock-user-id', email } as User,
      } as Session

      setTimeout(() => {
        authCallbacks.forEach((cb) => cb('SIGNED_IN', mockSession))
      }, 50)

      return { data: { session: mockSession }, error: null }
    },

    async signUp({ email }: { email: string }) {
      return { data: { user: { id: 'mock-user-id', email } as User }, error: null }
    },

    async signOut() {
      localStorage.removeItem('day_zero_os_mock_auth')
      localStorage.removeItem('day_zero_os_mock_email')
      setTimeout(() => {
        authCallbacks.forEach((cb) => cb('SIGNED_OUT', null))
      }, 50)
      return { error: null }
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      authCallbacks.add(callback)

      const isAuthed = localStorage.getItem('day_zero_os_mock_auth') === 'true'
      const mockSession = isAuthed
        ? ({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            user: {
              id: 'mock-user-id',
              email: localStorage.getItem('day_zero_os_mock_email') || 'builder@dayzero.dev',
            } as User,
          } as Session)
        : null

      callback(isAuthed ? 'SIGNED_IN' : 'SIGNED_OUT', mockSession)

      return {
        data: {
          subscription: {
            unsubscribe() {
              authCallbacks.delete(callback)
            },
          },
        },
      }
    },
  },

  from(tableName: string) {
    let currentTable = tableName
    if (tableName === 'knowledge_entries') currentTable = 'knowledge_entries'

    const db = getStoredData()
    let records = [...(db[currentTable] || [])]

    const builder = {
      select(_fields?: string, options?: any) {
        if (options && options.count === 'exact') {
          return {
            count: records.length,
            data: options.head ? null : records,
            error: null,
          } as any
        }
        return builder
      },
      eq(col: string, val: any) {
        records = records.filter((row) => row[col] === val)
        return builder
      },
      neq(col: string, val: any) {
        records = records.filter((row) => row[col] !== val)
        return builder
      },
      gte(col: string, val: any) {
        records = records.filter((row) => row[col] >= val)
        return builder
      },
      lte(col: string, val: any) {
        records = records.filter((row) => row[col] <= val)
        return builder
      },
      is(col: string, val: any) {
        records = records.filter((row) => row[col] === val)
        return builder
      },
      ilike(col: string, pattern: string) {
        const cleanPattern = pattern.replace(/%/g, '.*')
        const regex = new RegExp(cleanPattern, 'i')
        records = records.filter((row) => regex.test(String(row[col] ?? '')))
        return builder
      },
      not(col: string, op: string, val: any) {
        if (op === 'is' || op === 'eq') {
          records = records.filter((row) => row[col] !== val)
        }
        return builder
      },
      in(col: string, vals: any[]) {
        const set = new Set(vals)
        records = records.filter((row) => set.has(row[col]))
        return builder
      },
      order(col: string, options?: { ascending?: boolean }) {
        const asc = options?.ascending !== false
        records.sort((a, b) => {
          if (a[col] < b[col]) return asc ? -1 : 1
          if (a[col] > b[col]) return asc ? 1 : -1
          return 0
        })
        return builder
      },
      limit(count: number) {
        records = records.slice(0, count)
        return builder
      },
      _updates: undefined as any,
      _isDelete: false,
      executePending() {
        if (builder._updates) {
          const db = getStoredData()
          const table = db[currentTable] || []
          const idCol = currentTable === 'user_settings' ? 'user_id' : 'id'
          const filterVal = builder._eqVal
          const matchingIds = new Set(records.map((r) => r[idCol]))

          let updatedRow: any = null
          db[currentTable] = table.map((row) => {
            if (matchingIds.has(row[idCol]) || (filterVal !== undefined && row[idCol] === filterVal)) {
              updatedRow = { ...row, ...builder._updates, updated_at: new Date().toISOString() }
              return updatedRow
            }
            return row
          })

          if (updatedRow) {
            let notificationTitle = ''
            let notificationBody = ''
            let notificationType: 'project' | 'milestone' | 'content' | 'asset' | 'decision' | 'system' =
              'system'

            const oldRow = table.find((r) => r[idCol] === filterVal || matchingIds.has(r[idCol]))
            const oldStatus = oldRow?.status
            const newStatus = updatedRow.status

            if (newStatus && oldStatus !== newStatus) {
              if (currentTable === 'projects' && newStatus === 'completed') {
                notificationTitle = `Project Completed: ${updatedRow.name}`
                notificationBody = `Project "${updatedRow.name}" has been marked as completed successfully.`
                notificationType = 'project'
              } else if (currentTable === 'milestones' && newStatus === 'completed') {
                notificationTitle = `Milestone Achieved: ${updatedRow.title}`
                notificationBody = `Milestone "${updatedRow.title}" has been marked as completed.`
                notificationType = 'milestone'
              } else if (currentTable === 'project_tasks' && newStatus === 'done') {
                notificationTitle = `Task Completed: ${updatedRow.title}`
                notificationBody = `Task "${updatedRow.title}" has been completed.`
                notificationType = 'project'
              } else if (
                currentTable === 'project_bugs' &&
                (newStatus === 'fixed' || newStatus === 'closed')
              ) {
                notificationTitle = `Bug Resolved: ${updatedRow.title}`
                notificationBody = `Bug "${updatedRow.title}" status changed to ${newStatus}.`
                notificationType = 'project'
              } else if (currentTable === 'content_items' && newStatus === 'published') {
                notificationTitle = `Content Published: ${updatedRow.title}`
                notificationBody = `Content item "${updatedRow.title}" is now published on ${updatedRow.platform}.`
                notificationType = 'content'
              }
            }

            if (notificationTitle) {
              const notifications = db['notifications'] || []
              notifications.unshift({
                id: crypto.randomUUID(),
                type: notificationType,
                title: notificationTitle,
                body: notificationBody,
                read_at: null,
                created_at: new Date().toISOString(),
              })
              db['notifications'] = notifications
            }

            saveStoredData(db)
            records = records.map((row) => (matchingIds.has(row[idCol]) || row[idCol] === filterVal ? updatedRow : row))
          }
          builder._updates = undefined
        }
        if (builder._isDelete) {
          const db = getStoredData()
          const table = db[currentTable] || []
          const idCol = currentTable === 'user_settings' ? 'user_id' : 'id'

          // Identify IDs of records filtered by query builder
          const idsToDelete = new Set(records.map((row) => row[idCol]))

          db[currentTable] = table.filter((row) => !idsToDelete.has(row[idCol]))
          saveStoredData(db)

          records = []
          builder._isDelete = false
        }
      },
      async single() {
        builder.executePending()
        const row = records[0] || null
        return { data: row, error: row ? null : { code: 'PGRST116', message: 'No rows returned' } }
      },
      async maybeSingle() {
        builder.executePending()
        const row = records[0] || null
        return { data: row, error: null }
      },
      async insert(row: any) {
        const db = getStoredData()
        const table = db[currentTable] || []
        const newRow = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row }
        table.unshift(newRow)
        db[currentTable] = table
        saveStoredData(db)

        if (currentTable !== 'activity_log') {
          const actLog = db['activity_log'] || []
          actLog.unshift({
            id: crypto.randomUUID(),
            project_id: row.project_id || null,
            action: `Added ${currentTable.replace('_', ' ')}: "${row.title || row.name || row.decision || 'Item'}"`,
            entity_type: currentTable,
            created_at: new Date().toISOString(),
          })
          db['activity_log'] = actLog
          saveStoredData(db)
        }

        return { data: newRow, error: null }
      },
      update(updates: any) {
        builder._updates = updates
        return builder
      },
      delete() {
        builder._isDelete = true
        return builder
      },
      then(onfulfilled?: (value: any) => any) {
        builder.executePending()
        const result = { data: records, error: null, count: records.length }
        return Promise.resolve(result).then(onfulfilled)
      },
      _eqVal: undefined as any,
    }

    const origEq = builder.eq
    builder.eq = function (col: string, val: any) {
      if (col === 'id' || col === 'user_id') {
        builder._eqVal = val
      }
      return origEq.call(builder, col, val)
    }

    return builder
  },
}
