# Changelog

All notable changes to Day Zero OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-03

### Features
- **Mission Control**: Central command dashboard with focus timer, quick notes, recent activity, and high-level project metrics.
- **Workspace & Invitation System**: Multi-tenant architecture with full invitation lifecycle (generate secure secret, SHA-256 hash storage, accept, decline, cancel, resend, and copy secure link). Supported by responsive HTML templates.
- **Email Delivery System**: Pluggable provider model (Console, SMTP, Resend) supporting live dispatch via environment variables.
- **Workspace Settings & Management**: Settings panel to update name, logo, and description, manage active members/roles, and a secure Danger Zone for ownership transfer, leaving workspaces, and deleting workspaces.
- **Project Workspace**: Interactive Kanban board, project specifications, milestone tracking, and task lifecycle management.
- **Knowledge Base**: Markdown notes editor, architecture decisions, tag filtering, and structured documentation repository.
- **Asset Vault**: File asset storage, file versioning (`v1`, `v2`), and metadata tag organization.
- **Content Engine**: Content repurposing workflow transforming project milestones into docs, blog posts, and social updates.
- **Weekly Debrief**: Reflection logs, weekly statistics, and continuous builder progress tracking.
- **Search & Command Palette**: Ctrl+K / Cmd+K global search across projects, knowledge base entries, assets, and app navigation.
- **Auth & Dual-Engine Architecture**: Supabase Authentication with automatic offline local demo/mock mode fallback.
- **Progressive Web App (PWA)**: Full PWA support with offline app caching, service worker auto-updates, manifest shortcuts, and installability.

### Improvements
- Added static SEO meta tags, Open Graph card tags, and Twitter Cards to HTML shell.
- Implemented responsive Legal & SaaS information pages (`/privacy`, `/terms`, `/about`, `/support`).
- Added Password Reset flow (`/reset-password`) with Supabase email verification triggers.
- Enforced strict HTTP security headers in `vercel.json` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`).
- Added version badges (`v1.0.0`) and legal footers across Settings, Sidebar, and Login pages.

### Fixes
- Resolved TypeScript strict type compilation issues (`npm run typecheck` 100% clean).
- Excluded build output directories from ESLint linter scope.
- Fixed layout overflow on mobile breakpoints for Settings tabs and TopHeader controls.
