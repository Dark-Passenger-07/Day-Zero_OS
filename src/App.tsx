import { useState } from 'react'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import MissionControl from './components/MissionControl'
import Projects from './components/Projects'
import ProjectWorkspace from './components/ProjectWorkspace'
import ContentEngine from './components/ContentEngine'
import KnowledgeBase from './components/KnowledgeBase'
import AssetVault from './components/AssetVault'
import WeeklyDebrief from './components/WeeklyDebrief'
import Settings from './components/Settings'

export type Screen =
  | 'mission-control'
  | 'projects'
  | 'project-workspace'
  | 'content-engine'
  | 'knowledge-base'
  | 'asset-vault'
  | 'weekly-debrief'
  | 'settings'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [screen, setScreen] = useState<Screen>('mission-control')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'mission-control': return <MissionControl onNavigate={setScreen} />
      case 'projects': return <Projects onNavigate={setScreen} />
      case 'project-workspace': return <ProjectWorkspace onNavigate={setScreen} />
      case 'content-engine': return <ContentEngine />
      case 'knowledge-base': return <KnowledgeBase />
      case 'asset-vault': return <AssetVault />
      case 'weekly-debrief': return <WeeklyDebrief />
      case 'settings': return <Settings />
      default: return <MissionControl onNavigate={setScreen} />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)', overflow: 'hidden' }}>
      <Sidebar
        current={screen}
        collapsed={sidebarCollapsed}
        onNavigate={setScreen}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <main style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {renderScreen()}
      </main>
    </div>
  )
}
