export type Screen =
  | 'mission-control'
  | 'projects'
  | 'project-workspace'
  | 'content-engine'
  | 'knowledge-base'
  | 'asset-vault'
  | 'weekly-debrief'
  | 'notifications'
  | 'settings'

export const screenPaths: Record<Screen, string> = {
  'mission-control': '/mission-control',
  projects: '/projects',
  'project-workspace': '/projects/demo-project',
  'content-engine': '/content',
  'knowledge-base': '/knowledge',
  'asset-vault': '/assets',
  'weekly-debrief': '/weekly-debrief',
  notifications: '/notifications',
  settings: '/settings',
}

export function getScreenFromPath(pathname: string): Screen {
  if (pathname.startsWith('/projects/')) return 'project-workspace'
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname.startsWith('/content')) return 'content-engine'
  if (pathname.startsWith('/knowledge')) return 'knowledge-base'
  if (pathname.startsWith('/assets')) return 'asset-vault'
  if (pathname.startsWith('/weekly-debrief')) return 'weekly-debrief'
  if (pathname.startsWith('/notifications')) return 'notifications'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'mission-control'
}
