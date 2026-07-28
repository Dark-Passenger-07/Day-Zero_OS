# Day Zero OS Technical Design Specification

Status: Ready for implementation planning  
Source of truth: `C:\Users\Aravi\Downloads\PRD.pdf`  
UI foundation: Figma Make React + Vite app in this repository

## 1. Executive Summary

Day Zero OS is a project-centric operating system for builders. It is not a notes app, project manager, or AI chat app. Its core architectural rule is that projects are the primary domain entity and every major workflow either belongs to a project or links back to one.

The current React project is a strong high-fidelity prototype. It already expresses the intended product language: dark, calm, dense, premium, and builder-focused. It includes screens for Login, Mission Control, Projects, Project Workspace, Content Engine, Knowledge Base, Asset Vault, Weekly Debrief, and Settings. These screens should not be discarded. They should be refactored into production feature modules, shared primitives, typed domain models, real routing, Supabase data access, and strict engineering standards.

The recommended production architecture is:

- Frontend: React + TypeScript, with an incremental path from the current Vite app to the PRD-preferred Next.js App Router when the product is ready for server rendering and deployment on Vercel.
- Backend: Supabase Auth, PostgreSQL, Storage, RLS, and optional Edge Functions for AI, integrations, encryption, and background workflows.
- State: server state through a query/cache layer, UI state through small stores, auth through a provider, and no unnecessary global domain state.
- AI: optional, disabled by default, isolated behind an AI service boundary, and never required for core workflows.

## 2. Architecture Review

### Current Project Strengths

- The UI aligns well with the PRD: minimal dark theme, left navigation, strong hierarchy, and restrained accent colors.
- The screen inventory matches MVP modules: Mission Control, Projects, Project Workspace, Content Engine, Knowledge Base, Asset Vault, Weekly Debrief, Settings, and Login.
- The product philosophy is visible in the UI: projects are central, content flows from projects, and AI is optional in Settings.
- Lucide icons are used consistently.
- The app is small and easy to refactor because there are no deep coupling layers yet.

### Current Project Weaknesses

- No real routing. `App.tsx` uses local screen state and switch rendering.
- No Supabase integration, auth session handling, RLS-aware data layer, or persistence.
- All domain data is mock data embedded directly in components.
- Components mix data, business logic, event handlers, layout, and styling.
- Heavy inline styles prevent reuse, theming discipline, responsive consistency, and maintainable hover/focus states.
- No shared UI primitives for buttons, cards, tabs, tables, badges, forms, empty states, skeletons, command palette, modals, or toasts.
- No test setup, lint setup, formatter policy beyond `oxfmt`, or strict architectural boundaries.
- No feature folder structure.
- No global search implementation.
- No database migrations or generated database types.
- Some text has mojibake encoding artifacts, for example bullets, arrows, ellipses, and middle dots.
- Some PRD-required modules are absent or partial: AI Workspace, client structure, decisions, templates, global command/search, autosave, recycle bin, version history, and activity logging.

### Missing Modules

- Global command palette and search.
- Project creation/edit/archive flows.
- Project decisions/ADR capture.
- Project discovery, competitor research, user research, testing, deployment, retrospective, and video production sections.
- AI Workspace and prompt library, behind optional enablement.
- Supabase Auth flow and protected routes.
- Supabase Storage upload/preview/download flow.
- Activity log generation.
- Autosave and soft delete.
- Database migrations and RLS policies.
- Shared loading, error, empty, and permission states.

## 3. Recommended Technology Stack

### Immediate Stack

- React 19
- TypeScript strict mode
- Vite
- Tailwind CSS v4
- Lucide React
- Supabase JS client
- TanStack Query for server state
- Zustand for small UI state stores
- React Router if staying on Vite for the first implementation phase
- Zod for runtime validation
- React Hook Form for forms
- Vitest + React Testing Library
- Playwright for critical workflows
- ESLint + Prettier

### PRD Target Stack

The PRD recommends Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, Framer Motion, Supabase, PostgreSQL, Supabase Storage, and Vercel.

Recommendation: do not migrate to Next.js before the first production data architecture pass unless SSR, server components, or Vercel-native caching are immediately needed. First refactor the Vite app into feature modules. Then migrate to Next.js App Router in a controlled sprint if required. The folder design below supports both.

## 4. Target Folder Structure

```txt
src/
  app/
    App.tsx
    routes.tsx
    providers/
      AppProviders.tsx
      AuthProvider.tsx
      QueryProvider.tsx
      ThemeProvider.tsx
    layouts/
      AuthLayout.tsx
      WorkspaceLayout.tsx
  components/
    ui/
      Button.tsx
      Card.tsx
      Badge.tsx
      Tabs.tsx
      Input.tsx
      Select.tsx
      Toggle.tsx
      Progress.tsx
      Table.tsx
      EmptyState.tsx
      Skeleton.tsx
      Modal.tsx
      Toast.tsx
      CommandPalette.tsx
    layout/
      Sidebar.tsx
      PageHeader.tsx
      Breadcrumbs.tsx
      TopBar.tsx
    feedback/
      ErrorBoundary.tsx
      LoadingState.tsx
  features/
    auth/
      components/
      hooks/
      services/
      types.ts
    mission-control/
      components/
      hooks/
      services/
      types.ts
    projects/
      components/
      hooks/
      services/
      types.ts
    project-workspace/
      components/
      hooks/
      services/
      types.ts
    content/
      components/
      hooks/
      services/
      types.ts
    knowledge/
      components/
      hooks/
      services/
      types.ts
    assets/
      components/
      hooks/
      services/
      types.ts
    weekly-debrief/
      components/
      hooks/
      services/
      types.ts
    search/
      components/
      hooks/
      services/
      types.ts
    settings/
      components/
      hooks/
      services/
      types.ts
    ai/
      components/
      hooks/
      services/
      providers/
      types.ts
  lib/
    supabase/
      client.ts
      database.types.ts
      storage.ts
    config/
      env.ts
      constants.ts
    errors/
      AppError.ts
      error-map.ts
    validation/
    logging/
    dates.ts
    strings.ts
  stores/
    ui-store.ts
    command-store.ts
    active-project-store.ts
  styles/
    index.css
    tokens.css
  types/
    common.ts
    enums.ts
supabase/
  migrations/
  seed.sql
docs/
  technical-design-specification.md
```

## 5. Routing Strategy

### Vite Phase

Use React Router with protected layouts.

```txt
/login
/mission-control
/projects
/projects/:projectId
/projects/:projectId/overview
/projects/:projectId/planning
/projects/:projectId/development
/projects/:projectId/knowledge
/projects/:projectId/assets
/projects/:projectId/activity
/content
/knowledge
/assets
/weekly-debrief
/settings
/settings/ai
/search
```

### Next.js App Router Phase

```txt
app/
  (auth)/
    login/page.tsx
  (workspace)/
    layout.tsx
    mission-control/page.tsx
    projects/page.tsx
    projects/[projectId]/page.tsx
    projects/[projectId]/planning/page.tsx
    projects/[projectId]/development/page.tsx
    content/page.tsx
    knowledge/page.tsx
    assets/page.tsx
    weekly-debrief/page.tsx
    settings/page.tsx
```

The sidebar should navigate by route, not by local screen state. Project context should be derived from route params and active-project state.

## 6. Authentication and Authorization

### Authentication Flow

User opens app -> AuthProvider checks Supabase session -> unauthenticated users route to `/login` -> login/signup through Supabase Auth -> JWT session stored by Supabase client -> protected workspace routes load user profile and settings.

Supported MVP methods:

- Email/password
- Google
- GitHub

Future methods:

- Microsoft
- Apple
- Discord

### Authorization

Version 1 is individual-first, but all tables must still include owner scoping and RLS. This avoids a painful future migration when teams, workspaces, and organizations arrive.

Policy shape:

- Users can read/update only their own profile.
- Users can CRUD only projects where `owner_id = auth.uid()`.
- Child rows are accessible only when their parent project belongs to the current user.
- Weekly debriefs are accessible only when `user_id = auth.uid()`.
- Storage objects are scoped by user or project path.

Future roles:

- Owner
- Admin
- Editor
- Viewer

## 7. Database Design Guidelines

The PRD defines these core tables:

- users/profiles
- projects
- content
- assets
- knowledge
- decisions
- milestones
- activity_log
- weekly_debriefs
- settings
- ai_sessions, optional

Recommended improvements before implementation:

- Use `profiles` instead of `users` for application profile data because Supabase owns `auth.users`.
- Add `workspaces` early, even if each user has one workspace in v1. This keeps the app ready for teams and organizations.
- Keep `owner_id` on projects for simple v1 RLS, and optionally add `workspace_id` for future collaboration.
- Add soft delete fields to major entities: `deleted_at`, `archived_at`.
- Add `created_at`, `updated_at`, and `created_by` consistently.
- Use enums for status, priority, asset type, content status, AI provider, and knowledge category.
- Use `jsonb` for flexible metadata and analytics, but keep searchable and relational fields first-class columns.
- Add full-text search generated columns or search views for projects, content, knowledge, assets, decisions, and activity.
- Add indexes for `owner_id`, `project_id`, `status`, `updated_at`, `deadline`, and search vectors.
- Store encrypted AI provider keys outside client-readable tables. Prefer server-side encryption through Edge Functions or an external secrets store.

### Proposed MVP Schema

```txt
profiles
  id uuid primary key references auth.users(id)
  full_name text
  username text unique
  avatar_url text
  timezone text
  workspace_name text
  created_at timestamptz
  updated_at timestamptz

workspaces
  id uuid primary key
  owner_id uuid references auth.users(id)
  name text
  created_at timestamptz
  updated_at timestamptz

projects
  id uuid primary key
  workspace_id uuid references workspaces(id)
  owner_id uuid references auth.users(id)
  name text
  description text
  status project_status
  priority priority
  category text
  technologies text[]
  start_date date
  deadline date
  progress integer
  cover_image_url text
  archived_at timestamptz
  deleted_at timestamptz
  created_at timestamptz
  updated_at timestamptz

milestones
  id uuid primary key
  project_id uuid references projects(id)
  title text
  status milestone_status
  due_date date
  completed_date date
  notes text
  sort_order integer

content_items
  id uuid primary key
  project_id uuid references projects(id)
  platform text
  series text
  title text
  status content_status
  outline text
  script text
  thumbnail_asset_id uuid references assets(id)
  publish_date date
  analytics jsonb

assets
  id uuid primary key
  project_id uuid references projects(id)
  owner_id uuid references auth.users(id)
  asset_type asset_type
  file_name text
  file_url text
  storage_path text
  tags text[]
  description text
  metadata jsonb
  uploaded_at timestamptz

knowledge_entries
  id uuid primary key
  owner_id uuid references auth.users(id)
  project_id uuid references projects(id) nullable
  category knowledge_category
  title text
  body text
  tags text[]
  source text
  starred boolean
  created_at timestamptz
  updated_at timestamptz

decisions
  id uuid primary key
  project_id uuid references projects(id)
  decision text
  reason text
  alternatives_considered text
  final_choice text
  impact text
  decided_at date
  created_at timestamptz

activity_log
  id uuid primary key
  project_id uuid references projects(id)
  user_id uuid references auth.users(id)
  action text
  entity_type text
  entity_id uuid
  metadata jsonb
  created_at timestamptz

weekly_debriefs
  id uuid primary key
  user_id uuid references auth.users(id)
  week_start date
  week_end date
  wins text[]
  challenges text[]
  lessons text[]
  ai_discoveries text[]
  next_week_goals text[]
  metrics jsonb
  created_at timestamptz
  updated_at timestamptz

user_settings
  user_id uuid primary key references auth.users(id)
  theme text
  accent_color text
  sidebar_layout text
  default_project_view text
  notifications jsonb
  ai_enabled boolean
  ai_provider text nullable
  language text
  updated_at timestamptz

ai_sessions
  id uuid primary key
  project_id uuid references projects(id)
  user_id uuid references auth.users(id)
  provider ai_provider
  model text
  prompt text
  response text
  category text
  rating integer
  saved boolean
  tags text[]
  created_at timestamptz
```

## 8. Supabase Integration

### Client

- `lib/supabase/client.ts` owns browser client creation.
- `lib/supabase/database.types.ts` is generated from Supabase.
- Services call Supabase through feature-specific service modules.
- Components never call Supabase directly.

### Storage

Recommended buckets:

- `project-assets`
- `avatars`
- `content-thumbnails`

Storage path convention:

```txt
users/{userId}/projects/{projectId}/{assetType}/{assetId}-{fileName}
```

Rules:

- Store uploaded files once.
- Store external references as URLs in `assets`.
- Generate previews/thumbnails later through Edge Functions if needed.
- Use signed URLs for private files.

## 9. Search Architecture

MVP search should use PostgreSQL full-text search with indexed vectors.

Searchable entities:

- Projects
- Content
- Knowledge
- Assets
- Decisions
- Activity
- AI sessions only if AI is enabled
- Clients and templates in future releases

Search UI:

- Global command palette from sidebar search and keyboard shortcut.
- Search results grouped by entity.
- Results open directly into the relevant project context.
- Target response time: under 300ms.

Future:

- Vector search for semantic retrieval.
- Hybrid search combining full-text, recency, favorites, and project relevance.

## 10. State Management

Use the smallest state owner possible.

- Server state: TanStack Query.
- Auth state: AuthProvider.
- Theme/settings: ThemeProvider plus persisted user settings.
- UI state: Zustand for sidebar, command palette, active project, and transient UI.
- Form state: React Hook Form.
- URL state: filters, tabs, project IDs, and view modes that should be shareable.

Avoid prop drilling through layout routes. Avoid storing fetched domain records in global Zustand stores.

## 11. Frontend Architecture

### Layouts

- `AuthLayout`: centered login/signup/onboarding experience.
- `WorkspaceLayout`: sidebar, command palette, protected content outlet.
- `ProjectLayout`: project header, breadcrumbs, project tabs, nested project content.

### Component Hierarchy

Screen components should become route containers that compose:

- Feature query hook
- Page header
- Shared controls
- Feature-specific panels
- Shared UI primitives
- Empty/error/loading states

### Reusable Components

Extract from current UI:

- Sidebar
- PageHeader
- Button
- Card
- StatusBadge
- PriorityBadge
- ProgressBar
- Tabs
- SegmentedControl
- Table
- SearchInput
- Toggle
- SettingRow
- SectionTitle
- ActivityItem
- StatCard
- AssetGridItem
- EmptyState

### Lazy Loading

Lazy-load route-level feature modules:

- Content Engine
- Asset Vault
- Settings
- AI Workspace
- Analytics-heavy panels

### Server and Client Components

If migrated to Next.js:

- Server components: data-heavy static route shells, initial project lists, settings shells.
- Client components: forms, filters, tabs, command palette, drag/drop upload, autosave editors, real-time updates.

In the current Vite app, all components are client components by definition.

## 12. Backend Architecture

Supabase is the backend for v1:

- Auth: sessions, OAuth, email/password.
- Database: PostgreSQL with RLS.
- Storage: private buckets and signed URLs.
- Realtime: future activity updates and collaboration.
- Edge Functions: AI provider calls, encrypted key handling, integrations, thumbnail generation, import/export jobs.

Do not call AI providers directly from the browser. Do not expose provider API keys to client code.

## 13. Error Handling and Logging

### Error Handling

- Feature services return typed results or throw `AppError`.
- Route-level error boundaries show recoverable UI.
- Forms show field-level validation errors.
- Mutations use optimistic updates only when rollback is clear.
- Delete flows use confirmation, soft delete, and restore.

### Logging

Log:

- Auth events
- Project creation/update/archive/delete
- File uploads
- Search failures
- AI requests, only if AI is enabled
- Unexpected errors
- Security-sensitive changes

For MVP, store user-visible activity in `activity_log`; use an external error tracker later for exceptions.

## 14. Theme Architecture

- Keep dark mode as v1 default.
- Move CSS variables into `styles/tokens.css`.
- Use Tailwind utility classes for implementation.
- Preserve PRD palette: near black background, dark surfaces, subtle borders, white text, muted text, and sparse status accents.
- Support future light mode through CSS variable theme switching.

## 15. Testing Strategy

### Unit Tests

- Utilities
- Mappers
- Validation schemas
- Service error mapping

### Component Tests

- Shared UI primitives
- Filters and tabs
- Empty/loading/error states
- Accessibility basics

### Integration Tests

- Auth flow with mocked Supabase
- Project CRUD
- Asset upload metadata flow
- Search results rendering
- AI disabled/enabled setting behavior

### E2E Tests

- Login
- Create project
- Open project workspace
- Add knowledge entry
- Upload/link asset
- Create content from project
- Run weekly debrief
- Global search

## 16. Deployment Strategy

### Current Vite Path

- Build through `npm run build`.
- Deploy static app to Vercel/Netlify.
- Configure Supabase env vars.

### PRD Target

- Next.js App Router on Vercel.
- Supabase Cloud for backend.
- Branch previews for every PR.
- Separate Supabase projects for local, staging, and production.

Required env vars:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_ENV
VITE_APP_URL
```

Future server-only vars:

```txt
SUPABASE_SERVICE_ROLE_KEY
AI_KEY_ENCRYPTION_SECRET
OPENAI_API_KEY
ANTHROPIC_API_KEY
GEMINI_API_KEY
DEEPSEEK_API_KEY
```

## 17. Component Audit

| Component                                      | Decision | Reason                                                                                                                                                      |
| ---------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.tsx`                                      | MODIFY   | Keep as temporary shell, then replace screen state with routing, providers, protected layouts, and lazy routes.                                             |
| `Login.tsx`                                    | MODIFY   | Visual direction is good. Replace fake timeout auth with Supabase Auth, fix encoding, add validation, OAuth actions, error states, and accessibility.       |
| `Sidebar.tsx`                                  | MODIFY   | Keep navigation design and collapsed behavior. Convert to route-aware links, extract nav config, wire search/command palette, remove inline hover mutation. |
| `MissionControl.tsx`                           | MODIFY   | Strong PRD fit. Split into widgets, replace mock data with queries, add responsive grid and real "what should I work on next" logic.                        |
| `Projects.tsx`                                 | MODIFY   | Keep table/board/timeline concept. Extract view components, fix priority label bug where medium says High, add CRUD, filters, sorting, pagination.          |
| `ProjectWorkspace.tsx`                         | MODIFY   | Keep core shell. Expand tabs to full PRD project lifecycle, route tabs, extract milestones/tasks/activity/assets/knowledge panels.                          |
| `ContentEngine.tsx`                            | MODIFY   | Keep pipeline and views. Link content to project records, add script/outline persistence, templates, analytics model, and stage transitions.                |
| `KnowledgeBase.tsx`                            | MODIFY   | Keep categories and starred section. Add project linking, rich text/body support, tags, sources, search service, and reusable list/card components.         |
| `AssetVault.tsx`                               | MODIFY   | Keep category sidebar, grid/list views, storage summary. Add Supabase Storage upload, signed URLs, previews, metadata editing, and project links.           |
| `WeeklyDebrief.tsx`                            | MODIFY   | Keep reflection model. Align fields with PRD sections, persist weekly records, add project/content links, and future AI summary hooks.                      |
| `Settings.tsx`                                 | MODIFY   | Keep structure and optional AI stance. Split tabs into components, persist settings, secure AI provider configuration, add account/privacy actions.         |
| `Toggle` in `Settings.tsx`                     | MODIFY   | Promote to shared `components/ui/Toggle.tsx` with label support, keyboard support, and ARIA semantics.                                                      |
| `SettingRow` in `Settings.tsx`                 | MODIFY   | Promote to shared settings primitive.                                                                                                                       |
| `SectionTitle` in `Settings.tsx`               | MODIFY   | Promote to shared typography/section primitive.                                                                                                             |
| `src/index.css`                                | MODIFY   | Keep tokens but move to token file, fix font loading strategy, restore visible focus styles, and avoid hiding all scrollbars globally.                      |
| `src/main.tsx`                                 | KEEP     | Entry point is fine; later wrap with app providers.                                                                                                         |
| `src/imports/pasted_text/day-zero-os-brief.md` | KEEP     | Useful design reference. Fix encoding if it remains in source control.                                                                                      |

No generated component should be removed in Sprint 1. The correct path is controlled refactoring.

## 18. Implementation Roadmap

### Sprint 1: Project Setup

Objectives:

- Establish production architecture without changing product behavior.
- Add routing, providers, linting, formatting, tests, env validation, and shared folders.

Files involved:

- `src/App.tsx`
- `src/main.tsx`
- `src/app/*`
- `src/components/ui/*`
- `src/lib/config/env.ts`
- `package.json`
- `tsconfig.json`

Components:

- WorkspaceLayout
- AuthLayout
- Sidebar refactor
- Button, Card, Badge, Tabs, Toggle, Progress

Database changes:

- None, except Supabase project setup docs.

Acceptance criteria:

- App renders the same screens through routes.
- Build passes.
- TypeScript strictness is enabled.
- Shared UI primitives exist.
- No production feature behavior is added yet.

Risks:

- Refactor could accidentally alter visual polish.
- Inline style extraction can create regressions if done too broadly.

### Sprint 2: Authentication

Objectives:

- Implement Supabase Auth and protected routes.
- Persist profile and settings.

Files involved:

- `features/auth/*`
- `app/providers/AuthProvider.tsx`
- `features/settings/*`
- `lib/supabase/*`

Components:

- LoginForm
- OAuthButtons
- ProtectedRoute

Database changes:

- `profiles`
- `workspaces`
- `user_settings`
- RLS policies

Acceptance criteria:

- Email/password auth works.
- Google/GitHub hooks are ready.
- Unauthenticated users cannot access workspace routes.
- Session survives refresh.

Risks:

- RLS mistakes can expose data or block legitimate access.

### Sprint 3: Mission Control

Objectives:

- Replace mock dashboard data with real project/content/debrief queries.
- Compute today's mission, deadlines, recent activity, and quick actions.

Files involved:

- `features/mission-control/*`
- `features/projects/services/*`
- `features/weekly-debrief/services/*`

Components:

- TodayMissionCard
- CurrentProjectCard
- WeeklyProgressCard
- DeadlinesList
- RecentActivityList
- QuickActions

Database changes:

- `activity_log`
- indexes on project deadline/status

Acceptance criteria:

- Mission Control answers "what should I work on next?"
- Empty states guide first project creation.
- Navigation to relevant entities works.

Risks:

- Overloading the page with metrics instead of execution cues.

### Sprint 4: Projects

Objectives:

- Implement project CRUD, table/board/timeline views, filters, sorting, archive, and templates placeholder.

Files involved:

- `features/projects/*`
- `features/project-workspace/*`

Components:

- ProjectTable
- ProjectBoard
- ProjectTimeline
- ProjectForm
- ProjectStatusBadge

Database changes:

- `projects`
- enums for status/priority
- indexes and RLS

Acceptance criteria:

- User can create a project in under one minute.
- Projects are searchable/filterable.
- Archive does not hard delete data.

Risks:

- Scope creep into full project workspace before CRUD is stable.

### Sprint 5: Project Workspace

Objectives:

- Build project detail route and lifecycle tabs.
- Implement milestones, tasks/sections, decisions, activity, linked knowledge/assets/content.

Files involved:

- `features/project-workspace/*`
- `features/projects/*`
- `features/knowledge/*`
- `features/assets/*`

Components:

- ProjectHeader
- ProjectTabs
- MilestoneList
- DecisionList
- ActivityTimeline
- LinkedAssets
- LinkedKnowledge

Database changes:

- `milestones`
- `decisions`
- `activity_log`

Acceptance criteria:

- Opening a project feels like a dedicated project OS.
- Decisions can be captured.
- Activity appears automatically for major actions.

Risks:

- Too many project sections can reduce clarity; use progressive disclosure.

### Sprint 6: Knowledge Base

Objectives:

- Implement knowledge entries, categories, tags, sources, starred entries, project links, and search.

Files involved:

- `features/knowledge/*`
- `features/search/*`

Components:

- KnowledgeList
- KnowledgeCard
- KnowledgeEditor
- KnowledgeFilters

Database changes:

- `knowledge_entries`
- optional join table if one entry links to many projects

Acceptance criteria:

- User can create, edit, star, tag, and link knowledge.
- Knowledge can exist independently or attach to a project.

Risks:

- Rich text complexity; start with markdown/plain text editor if needed.

### Sprint 7: Content Engine

Objectives:

- Implement content items linked to projects, stages, scripts/outlines, publishing metadata, and analytics fields.

Files involved:

- `features/content/*`
- `features/projects/services/*`

Components:

- ContentPipeline
- ContentTable
- ContentForm
- ScriptEditor
- AnalyticsPanel

Database changes:

- `content_items`

Acceptance criteria:

- Content can be created from a project.
- Stage transitions are persisted.
- Published content can store basic analytics.

Risks:

- Analytics integrations should remain manual in MVP.

### Sprint 8: Asset Vault

Objectives:

- Implement asset upload, external links, project linking, metadata, grid/list views, previews, and storage summary.

Files involved:

- `features/assets/*`
- `lib/supabase/storage.ts`

Components:

- AssetGrid
- AssetList
- AssetUploader
- AssetPreview
- AssetMetadataForm

Database changes:

- `assets`
- Supabase Storage buckets and policies

Acceptance criteria:

- User can upload and link files.
- User can add GitHub/Figma/reference URLs.
- Private assets are protected by RLS/storage policies.

Risks:

- Large upload handling and preview generation may need Edge Functions later.

### Sprint 9: Search

Objectives:

- Implement global command palette and cross-entity search.

Files involved:

- `features/search/*`
- `components/ui/CommandPalette.tsx`
- Supabase SQL search functions/views

Components:

- CommandPalette
- SearchResultGroup
- SearchResultItem

Database changes:

- search vectors/views/functions
- indexes

Acceptance criteria:

- Search is available everywhere.
- Results return under 300ms for MVP-sized data.
- Results open in project context.

Risks:

- Search quality can suffer if schemas lack normalized titles/tags.

### Sprint 10: Optional AI

Objectives:

- Add AI settings, provider abstraction, prompt library, project context builder, and saved sessions.

Files involved:

- `features/ai/*`
- `features/settings/*`
- Supabase Edge Functions

Components:

- AISettings
- PromptLibrary
- AISessionList
- AIAssistButton

Database changes:

- `ai_sessions`
- encrypted provider key storage strategy

Acceptance criteria:

- AI is disabled by default.
- The app is fully usable without AI.
- AI calls require explicit user action.
- Saved prompts are searchable and reusable.

Risks:

- API key security. Never store keys in client-readable plaintext.

### Sprint 11: Testing

Objectives:

- Expand unit, component, integration, and e2e coverage.
- Add accessibility checks.

Files involved:

- `tests/*`
- `playwright.config.ts`
- `vitest.config.ts`

Components:

- Critical route flows
- Shared UI primitives

Database changes:

- Seed data for tests

Acceptance criteria:

- Core workflows pass e2e.
- Build and lint pass in CI.
- Critical components have accessible names and keyboard behavior.

Risks:

- Retrofitting tests late can reveal architectural coupling; keep service boundaries clean earlier.

### Sprint 12: Deployment

Objectives:

- Prepare staging and production environments.
- Configure CI/CD, env vars, Supabase migrations, backups, monitoring, and release checklist.

Files involved:

- CI config
- Supabase migrations
- deployment docs
- env examples

Components:

- Error boundary
- Maintenance/empty states

Database changes:

- Production migrations
- backup policy

Acceptance criteria:

- Staging deploy works.
- Production deploy checklist is documented.
- Supabase RLS verified.
- Performance budgets are checked.

Risks:

- Env drift between local, staging, and production.

## 19. Engineering Decisions

- Keep the Figma-generated UI as the visual foundation.
- Refactor before rebuilding.
- Use feature-based architecture.
- Treat projects as the central entity across frontend, database, search, and AI context.
- Use Supabase as the backend for MVP.
- Use RLS from the first schema migration.
- Keep AI optional, isolated, disabled by default, and server-mediated.
- Prefer URL state for route-level filters and tabs.
- Prefer typed feature services over direct Supabase calls in components.
- Add `workspaces` early to support future teams without redesign.
- Use soft delete for important user data.
- Use full-text search first, vector search later.

## 20. Development Guidelines

- Never duplicate components.
- Reuse existing UI patterns and extract shared primitives.
- Keep business logic out of UI components.
- Keep components small and composable.
- Use strict TypeScript.
- Use custom hooks for feature queries and mutations.
- Avoid prop drilling by using layouts, context, and scoped stores.
- Maintain accessibility: semantic elements, focus states, keyboard navigation, labels, and ARIA where needed.
- Optimize performance with lazy routes, memoized derived data, pagination, and indexed queries.
- Add loading, empty, and error states for every data view.
- Keep AI features invisible or non-disruptive when disabled.
- Document architectural decisions in `docs/adr/`.

## 21. Coding Standards

- TypeScript strict mode required.
- ESLint required.
- Prettier required.
- No implicit `any`.
- No direct domain mock data inside production components after feature migration.
- No direct Supabase calls inside presentational components.
- Use PascalCase for components.
- Use camelCase for variables/functions.
- Use kebab-case for route segments and feature folder names.
- Use `*.service.ts` for data access.
- Use `use*.ts` for hooks.
- Use `*.types.ts` or `types.ts` for domain types.
- Use `*.schema.ts` for Zod schemas.
- Use named exports for shared utilities and UI primitives.
- Prefer composition over inheritance.
- Prefer explicit domain enums/types over stringly typed state.

## 22. Ready-to-Start Implementation Plan

Before writing production features:

1. Approve this TDS.
2. Confirm whether to stay on Vite for MVP implementation or migrate to Next.js first.
3. Create Supabase local/staging project.
4. Add env validation and Supabase client.
5. Add routing and providers.
6. Extract shared UI primitives from the current components.
7. Move current screens into feature folders without changing behavior.
8. Add database migrations with RLS.
9. Implement Sprint 2 authentication.
10. Continue through the sprint roadmap in order.

The first implementation task should be Sprint 1 only. Do not start feature CRUD until routing, providers, shared UI primitives, TypeScript strictness, and architecture boundaries are in place.
