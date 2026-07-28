-- Migration: One-time Orphan Data Cleanup
-- Day Zero OS V1.0

DO $$
DECLARE
  v_milestones_cleaned INT := 0;
  v_tasks_cleaned INT := 0;
  v_bugs_cleaned INT := 0;
  v_debt_cleaned INT := 0;
  v_repos_cleaned INT := 0;
  v_notes_cleaned INT := 0;
  v_content_cleaned INT := 0;
  v_decisions_cleaned INT := 0;
  v_notifications_cleaned INT := 0;
  v_ai_sessions_cleaned INT := 0;
  v_assets_cleaned INT := 0;
  v_knowledge_disassociated INT := 0;
  v_activity_logs_cleaned INT := 0;
BEGIN
  -- 1. Delete milestones whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.milestones
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = milestones.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = milestones.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_milestones_cleaned FROM deleted_rows;

  -- 2. Delete project_tasks whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.project_tasks
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_tasks.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_tasks.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_tasks_cleaned FROM deleted_rows;

  -- 3. Delete project_bugs whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.project_bugs
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_bugs.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_bugs.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_bugs_cleaned FROM deleted_rows;

  -- 4. Delete technical_debt_items whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.technical_debt_items
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = technical_debt_items.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = technical_debt_items.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_debt_cleaned FROM deleted_rows;

  -- 5. Delete project_repositories whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.project_repositories
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_repositories.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_repositories.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_repos_cleaned FROM deleted_rows;

  -- 6. Delete development_notes whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.development_notes
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = development_notes.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = development_notes.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_notes_cleaned FROM deleted_rows;

  -- 7. Delete content_items whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.content_items
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = content_items.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = content_items.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_content_cleaned FROM deleted_rows;

  -- 8. Delete architecture_decisions whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.architecture_decisions
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = architecture_decisions.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = architecture_decisions.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_decisions_cleaned FROM deleted_rows;

  -- 9. Delete notifications whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.notifications
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = notifications.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = notifications.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_notifications_cleaned FROM deleted_rows;

  -- 10. Delete ai_sessions whose project doesn't exist or is soft-deleted
  WITH deleted_rows AS (
    DELETE FROM public.ai_sessions
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = ai_sessions.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = ai_sessions.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_ai_sessions_cleaned FROM deleted_rows;

  -- 11. Delete assets whose project doesn't exist or is soft-deleted (cascades to asset_versions)
  WITH deleted_rows AS (
    DELETE FROM public.assets
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = assets.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = assets.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_assets_cleaned FROM deleted_rows;

  -- 12. Disassociate knowledge_entries (set project_id = NULL) for deleted/non-existent projects
  WITH updated_rows AS (
    UPDATE public.knowledge_entries
    SET project_id = NULL
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = knowledge_entries.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = knowledge_entries.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_knowledge_disassociated FROM updated_rows;

  -- 13. Delete activity_logs LAST (clears any orphaned activity logs or logs created by delete triggers)
  WITH deleted_rows AS (
    DELETE FROM public.activity_logs
    WHERE project_id IS NOT NULL AND (
      NOT EXISTS (SELECT 1 FROM public.projects p WHERE p.id = activity_logs.project_id)
      OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = activity_logs.project_id AND p.deleted_at IS NOT NULL)
    )
    RETURNING id
  )
  SELECT count(*) INTO v_activity_logs_cleaned FROM deleted_rows;

  RAISE NOTICE 'Orphan Cleanup Summary: Milestones %, Tasks %, Bugs %, Debt %, Repos %, Notes %, Content %, Decisions %, Notifications %, AISessions %, Assets %, Knowledge Disassociated %, Activity Logs %',
    v_milestones_cleaned, v_tasks_cleaned, v_bugs_cleaned, v_debt_cleaned, v_repos_cleaned,
    v_notes_cleaned, v_content_cleaned, v_decisions_cleaned, v_notifications_cleaned,
    v_ai_sessions_cleaned, v_assets_cleaned, v_knowledge_disassociated, v_activity_logs_cleaned;
END $$;

NOTIFY pgrst, 'reload schema';
