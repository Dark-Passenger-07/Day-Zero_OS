import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, FileText, HelpCircle, Info } from 'lucide-react'
import logoImg from '@/logo.png'

interface LegalLayoutProps {
  title: string
  subtitle: string
  icon?: React.ReactNode
  children: React.ReactNode
}

export function LegalLayout({ title, subtitle, icon, children }: LegalLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-card/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/mission-control')}>
          <img src={logoImg} alt="Day Zero OS" className="w-7 h-7 rounded object-contain" />
          <span className="text-base font-semibold tracking-tight text-foreground">Day Zero OS</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="p-2 rounded-lg bg-secondary text-foreground">{icon}</div>}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed space-y-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Day Zero OS. All rights reserved. Version 1.0.0
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/privacy')}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Shield size={12} /> Privacy
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <FileText size={12} /> Terms
            </button>
            <button
              onClick={() => navigate('/about')}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Info size={12} /> About
            </button>
            <button
              onClick={() => navigate('/support')}
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <HelpCircle size={12} /> Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
