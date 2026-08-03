# Day Zero OS — Permission Model & Security Architecture (RBAC)

**Version**: 1.0.0 Security Specification  
**Status**: Formal Specification — Multi-Tenant Architecture Migration

---

## 1. Overview & Security Architecture

Day Zero OS uses **Row Level Security (RLS)** in PostgreSQL powered by reusable `SECURITY DEFINER` SQL helper functions. Permission evaluation occurs at the database layer, ensuring that no tenant can read or mutate data belonging to another workspace under any circumstance.

---

## 2. Role-Based Access Control (RBAC) Matrix

Day Zero OS defines four standard workspace roles:

| Permission / Action | Owner | Admin | Editor | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **View Workspace Projects, Assets, Notes & Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Create & Edit Projects, Tasks, Milestones, Assets** | ✅ | ✅ | ✅ | ❌ |
| **Delete Projects, Tasks, Assets** | ✅ | ✅ | ❌ | ❌ |
| **Invite & Remove Workspace Members** | ✅ | ✅ | ❌ | ❌ |
| **Update Member Roles (Admin / Editor / Viewer)** | ✅ | ✅ | ❌ | ❌ |
| **Manage Workspace Branding & Settings** | ✅ | ✅ | ❌ | ❌ |
| **Transfer Workspace Ownership** | ✅ | ❌ | ❌ | ❌ |
| **Delete Team Workspace** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Centralized SQL Security Helper Functions

All RLS policies call centralized `SECURITY DEFINER` helper functions:

```sql
-- Helper 1: Membership Check
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = target_user_id
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper 2: Role Extraction
CREATE OR REPLACE FUNCTION public.get_workspace_role(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id
    AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper 3: Management Permission Check (Owner or Admin)
CREATE OR REPLACE FUNCTION public.can_manage_workspace(target_workspace_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = target_workspace_id
      AND user_id = target_user_id
      AND status = 'active'
      AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper 4: Project Access Check via Inherited workspace_id
CREATE OR REPLACE FUNCTION public.is_project_workspace_member(target_project_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id = target_project_id
      AND wm.user_id = target_user_id
      AND wm.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper 5: Can Edit Project / Child Items (Editor, Admin, Owner)
CREATE OR REPLACE FUNCTION public.can_edit_project(target_project_id UUID, target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id = target_project_id
      AND wm.user_id = target_user_id
      AND wm.status = 'active'
      AND wm.role IN ('owner', 'admin', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## 4. Design for Deferred Future Project-Level Permissions

In v1.0, permissions are evaluated at the **workspace level**. Project-level permissions are intentionally deferred to future versions (v1.1+).

### Future Schema Architecture (Placeholder Concept - Defer Implementation):
```sql
-- Future v1.1 Table (Do NOT implement in v1.0)
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('project_lead', 'contributor', 'reviewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
```

### Zero Redesign Compatibility Proof:
Because child tables (tasks, milestones, bugs, debt, repositories, notes) inherit permissions through `project_id`, updating the `public.can_edit_project()` helper function in v1.1 to evaluate `project_members` will upgrade permission granularity across all child tables automatically, without requiring any schema modifications to child tables!
