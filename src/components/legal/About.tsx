import { Info, Cpu, Layers, Rocket, Target, Zap } from 'lucide-react'
import { LegalLayout } from './LegalLayout'

export default function About() {
  return (
    <LegalLayout
      title="About Day Zero OS"
      subtitle="Version 1.0.0 (Build 1) • Operating System for Builders"
      icon={<Info size={22} className="text-emerald-400" />}
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Rocket size={18} className="text-primary" /> Why Day Zero OS Exists
        </h2>
        <p>
          Day Zero OS is a next-generation operating system for builders—a unified digital workspace designed to help software engineers, AI builders, freelancers, startup founders, and creators manage the complete lifecycle of building products.
        </p>
        <p>
          Unlike traditional productivity tools that focus on isolated tasks or notes, Day Zero OS is centered around the journey of creating something meaningful. It connects every stage of the process—from an initial idea to research, planning, design, development, deployment, documentation, content creation, and continuous learning—into a single, integrated workflow.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="bg-card border border-border p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Target size={16} className="text-blue-400" />
            <span>Mission</span>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            To simplify the process of building by providing a single platform where builders can think, plan, code, document, and share without context switching.
          </p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Zap size={16} className="text-amber-400" />
            <span>Execution First</span>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            Encouraging execution over planning, continuous learning over perfection, and robust systems over shortcuts.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers size={18} className="text-purple-400" /> Core Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-secondary/40 border border-border rounded-lg">
            <div className="font-semibold text-foreground mb-1">Mission Control</div>
            <div className="text-muted-foreground">Central command hub, focus timer, quick actions, and high-level project metrics.</div>
          </div>
          <div className="p-3 bg-secondary/40 border border-border rounded-lg">
            <div className="font-semibold text-foreground mb-1">Project Workspace</div>
            <div className="text-muted-foreground">Kanban boards, project specs, milestone tracking, and task execution.</div>
          </div>
          <div className="p-3 bg-secondary/40 border border-border rounded-lg">
            <div className="font-semibold text-foreground mb-1">Knowledge Base</div>
            <div className="text-muted-foreground">Structured markdown notes, architecture decisions, and code snippets.</div>
          </div>
          <div className="p-3 bg-secondary/40 border border-border rounded-lg">
            <div className="font-semibold text-foreground mb-1">Asset Vault</div>
            <div className="text-muted-foreground">File management, design assets, and asset version tracking.</div>
          </div>
          <div className="p-3 bg-secondary/40 border border-border rounded-lg">
            <div className="font-semibold text-foreground mb-1">Content Engine</div>
            <div className="text-muted-foreground">Turn project milestones into documentation, blog posts, and social posts.</div>
          </div>
          <div className="p-3 bg-secondary/40 border border-border rounded-lg">
            <div className="font-semibold text-foreground mb-1">Weekly Debrief</div>
            <div className="text-muted-foreground">Reflection logs, weekly statistics, and continuous builder progress tracking.</div>
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Cpu size={16} className="text-emerald-400" />
          <span>Technology & Architecture</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Built with React 19, Vite, TypeScript, Tailwind CSS v4, Supabase (with offline local fallback mode), and Progressive Web App (PWA) standards.
        </p>
      </section>
    </LegalLayout>
  )
}
