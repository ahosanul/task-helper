-- Tasks (Jira-synced and local)
CREATE TABLE IF NOT EXISTS tasks (
  id                      TEXT PRIMARY KEY,         -- UUID
  title                   TEXT NOT NULL,
  description             TEXT,
  source                  TEXT NOT NULL CHECK(source IN ('jira', 'local')),

  -- Jira fields (null for local tasks)
  jira_key                TEXT UNIQUE,              -- e.g. PROJ-101
  jira_url                TEXT,
  jira_updated_at         TEXT,                     -- ISO timestamp from Jira

  -- Time fields from Jira (in seconds)
  jira_estimated_seconds  INTEGER DEFAULT 0,
  jira_logged_seconds     INTEGER DEFAULT 0,
  jira_remaining_seconds  INTEGER DEFAULT 0,

  -- Local estimate (for local tasks only, in minutes)
  local_estimated_minutes INTEGER DEFAULT 0,

  -- Common fields
  status                  TEXT DEFAULT 'todo',      -- todo | in_progress | done | done_on_jira
  priority                TEXT DEFAULT 'medium',    -- critical | high | medium | low
  due_date                TEXT,                     -- ISO date string
  parent_id               TEXT REFERENCES tasks(id),-- for subtasks
  parent_jira_key         TEXT,                     -- jira parent key if subtask of jira task
  is_pinned               INTEGER DEFAULT 0,        -- 1 = pinned to mini board
  completed_at            TEXT,
  created_at              TEXT DEFAULT (datetime('now')),
  updated_at              TEXT DEFAULT (datetime('now'))
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id         TEXT PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1'
);

-- Task-Tag join table
CREATE TABLE IF NOT EXISTS task_tags (
  task_id    TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id     TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- Time entries (all local, never synced to Jira)
CREATE TABLE IF NOT EXISTS time_entries (
  id                      TEXT PRIMARY KEY,
  task_id                 TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  started_at              TEXT NOT NULL,            -- ISO timestamp
  ended_at                TEXT,                     -- ISO timestamp, null if active
  auto_detected_seconds   INTEGER DEFAULT 0,        -- raw timer duration
  logged_minutes          INTEGER DEFAULT 0,        -- user-adjusted value
  comment                 TEXT,                     -- required on save
  created_at              TEXT DEFAULT (datetime('now'))
);

-- App settings
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_source       ON tasks(source);
CREATE INDEX IF NOT EXISTS idx_tasks_status       ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id    ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_jira_key     ON tasks(jira_key);
CREATE INDEX IF NOT EXISTS idx_time_entries_task  ON time_entries(task_id);
