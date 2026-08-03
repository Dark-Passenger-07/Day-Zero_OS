# Changelog

All notable changes to Day Zero OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-04

### Added
- **Multi-Platform Preparation Configuration:**
  - Added Capacitor configurations (`capacitor.config.ts`) and `package.json` CLI command hooks to support Android and iOS mobile app compilation.
  - Built a complete Tauri v2 desktop structure (`src-tauri/`) including `Cargo.toml`, `tauri.conf.json`, and Rust wrapper modules (`main.rs`, `lib.rs`, `build.rs`).
  - Created Microsoft Store MSIX package templates (`publish/windows/AppXManifest.xml`) and Partner Center metadata configurations (`publish/windows/PwaStoreMetadata.json`).
- **PWA Auto-Update Notifier:**
  - Created a beautiful custom React component `PwaUpdater.tsx` using `useRegisterSW` hook from `vite-plugin-pwa` to prompt users to reload the workspace when a new version is available.
- **Client Security Throttles:**
  - Introduced `useRateLimit` throttle hook (`src/hooks/useRateLimit.ts`) to prevent rapid duplicate action submissions.
  - Implemented `sanitizeString` helper (`src/lib/security/sanitize.ts`) to clean text fields and block XSS.
- **Reduced Motion Support:**
  - Added CSS animations disabling media queries in `index.css` to align with the operating system's `prefers-reduced-motion` settings.

### Improved
- **Owner Role Resolution:**
  - Prioritized the workspace `owner_id` check when computing the user's role in the service layer and `WorkspaceContext.tsx`. Users who created the workspace are guaranteed to be resolved as `owner`, regardless of their membership records.
- **Self-Healing Owner Role Repair:**
  - Enhanced the database self-healing mechanism to automatically correct active owners with incorrect membership roles in the database.
- **Settings Inputs Visual Disabling:**
  - Tied settings inputs and the Default Join Role select dropdown to active capabilities. Normal members see them visually deactivated (`opacity-50`, `cursor-not-allowed`).

---

## [1.0.0] - 2026-08-03

### Features
- **Mission Control**: Central command dashboard with focus timer, quick notes, recent activity, and high-level project metrics.
- **Workspace & Invitation System**: Multi-tenant architecture with full invitation lifecycle.
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
- **Legal & SaaS Pages**: Added `/privacy`, `/terms`, `/about`, and `/support` info.
