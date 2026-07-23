# Day Zero OS V1.0 Database Schema

## Diagram

```text
auth.users
  |-- profiles
  |-- user_settings
  |-- workspaces
  |     |-- projects
  |           |-- milestones
  |           |-- architecture_decisions
  |           |-- activity_logs
  |           |-- knowledge_entries
  |           |-- content_items
  |           |     |-- assets (thumbnail_asset_id)
  |           |-- assets
  |-- weekly_debriefs
  |-- notifications
  |-- ai_sessions

storage.buckets
  |-- project-assets
  |-- avatars
  |-- covers
  |-- documents
  |-- assets
```

## Relationships

- `profiles` extends `auth.users`.
- `workspaces` are user-owned and provide the V1 foundation for future multi-workspace support.
- `projects` belong to one workspace and one owner.
- `milestones`, `content_items`, `assets`, `knowledge_entries`, `architecture_decisions`, and `activity_logs` attach to projects.
- `weekly_debriefs`, `notifications`, `user_settings`, and `ai_sessions` are user-owned.
- Compatibility views `decisions` and `activity_log` keep the current app working while the canonical tables are `architecture_decisions` and `activity_logs`.

## Indexes

The migration indexes all main ownership and filtering paths: `owner_id`, `user_id`, `workspace_id`, `project_id`, `status`, `priority`, `created_at`, and `updated_at`.

Full-text search GIN indexes are prepared on:

- `projects.search_vector`
- `knowledge_entries.search_vector`
- `content_items.search_vector`
- `assets.search_vector`

## RLS

RLS is enabled on every user-owned table. Policies enforce:

- users can only access their own profile/settings/workspaces/projects;
- project children are accessible only when the current user owns the parent project;
- user-owned records such as debriefs, notifications, AI sessions, and assets require `auth.uid()`;
- storage writes are restricted to a folder named by the user id.

## Triggers

- `updated_at` is maintained automatically.
- `handle_new_user()` creates profile, settings, and default workspace after signup.
- project create/update activity is logged.
- milestone completion activity is logged.

## Storage

Buckets prepared:

- `project-assets`
- `avatars`
- `covers`
- `documents`
- `assets`

Public buckets are readable. Documents are private to the owning user folder.

## Scalability

The schema is normalized around users, workspaces, projects, and project child records. V1 avoids teams, organizations, marketplace, plugins, and enterprise features, but workspace ownership and project-scoped child tables leave room for future collaborative extensions without rewriting core data.
