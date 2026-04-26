const { getDatabase } = require('../db/connection');

// GET / Fetch all tasks with optional filters
async function getAllTasks(filters = {}) {
  const db = getDatabase();
  
  let query = `
    SELECT t.*, 
           GROUP_CONCAT(tg.id) as tag_ids,
           GROUP_CONCAT(tg.name) as tag_names,
           GROUP_CONCAT(tg.color) as tag_colors
    FROM tasks t
    LEFT JOIN task_tags tt ON t.id = tt.task_id
    LEFT JOIN tags tg ON tt.tag_id = tg.id
  `;
  
  const conditions = [];
  if (filters.source && filters.source !== 'all') {
    conditions.push(`t.source = ?`);
  }
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'active') {
      conditions.push(`t.status NOT IN ('done', 'done_on_jira')`);
    } else {
      conditions.push(`t.status = ?`);
    }
  }
  if (filters.priority && filters.priority.length > 0) {
    conditions.push(`t.priority IN (${filters.priority.map(() => '?').join(',')})`);
  }
  if (filters.parentId) {
    conditions.push(`t.parent_id = ?`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY t.id ORDER BY t.created_at DESC';
  
  const params = [];
  if (filters.source && filters.source !== 'all') {
    params.push(filters.source);
  }
  if (filters.status && filters.status !== 'all' && filters.status !== 'active') {
    params.push(filters.status);
  }
  if (filters.priority && filters.priority.length > 0) {
    params.push(...filters.priority);
  }
  if (filters.parentId) {
    params.push(filters.parentId);
  }
  
  const rows = db.prepare(query).all(...params);
  
  return rows.map(row => ({
    ...row,
    isPinned: !!row.is_pinned,
    tags: row.tag_ids ? row.tag_ids.split(',').map((id, i) => ({
      id,
      name: row.tag_names.split(',')[i],
      color: row.tag_colors.split(',')[i]
    })) : []
  }));
}

// GET / Fetch single task by ID
function getTaskById(id) {
  const db = getDatabase();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  
  if (!task) return null;
  
  const tags = db.prepare(`
    SELECT tg.* FROM tags tg
    JOIN task_tags tt ON tg.id = tt.tag_id
    WHERE tt.task_id = ?
  `).all(id);
  
  const timeEntries = db.prepare(`
    SELECT * FROM time_entries WHERE task_id = ? ORDER BY started_at DESC
  `).all(id);
  
  const subtasks = db.prepare('SELECT * FROM tasks WHERE parent_id = ?').all(id);
  
  return {
    ...task,
    isPinned: !!task.is_pinned,
    tags,
    timeEntries,
    subtasks
  };
}

// POST / Create new task
function createTask(taskData) {
  const db = getDatabase();
  const {
    id, title, description, source,
    jiraKey, jiraUrl, jiraUpdatedAt,
    jiraEstimatedSeconds, jiraLoggedSeconds, jiraRemainingSeconds,
    localEstimatedMinutes,
    status, priority, dueDate, parentId, parentJiraKey, isPinned
  } = taskData;
  
  const stmt = db.prepare(`
    INSERT INTO tasks (
      id, title, description, source,
      jira_key, jira_url, jira_updated_at,
      jira_estimated_seconds, jira_logged_seconds, jira_remaining_seconds,
      local_estimated_minutes,
      status, priority, due_date, parent_id, parent_jira_key, is_pinned
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id, title, description || null, source,
    jiraKey || null, jiraUrl || null, jiraUpdatedAt || null,
    jiraEstimatedSeconds || 0, jiraLoggedSeconds || 0, jiraRemainingSeconds || 0,
    localEstimatedMinutes || 0,
    status || 'todo', priority || 'medium', dueDate || null, parentId || null, parentJiraKey || null, isPinned ? 1 : 0
  );
  
  return getTaskById(id);
}

// PUT / Update task fields
function updateTask(id, fields) {
  const db = getDatabase();
  const allowedFields = [
    'title', 'description', 'status', 'priority', 'due_date',
    'local_estimated_minutes', 'is_pinned', 'completed_at'
  ];
  
  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(fields)) {
    const dbCol = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbCol)) {
      updates.push(`${dbCol} = ?`);
      values.push(value);
    }
  }
  
  if (updates.length === 0) return getTaskById(id);
  
  updates.push(`updated_at = datetime('now')`);
  values.push(id);
  
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  
  return getTaskById(id);
}

// DELETE / Remove task
function deleteTask(id) {
  const db = getDatabase();
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return true;
}

// Toggle task completion
function toggleComplete(id) {
  const db = getDatabase();
  const task = db.prepare('SELECT status, completed_at FROM tasks WHERE id = ?').get(id);
  
  if (!task) return null;
  
  const isDone = task.status === 'done' || task.status === 'done_on_jira';
  const newStatus = isDone ? 'todo' : 'done';
  const completedAt = isDone ? null : new Date().toISOString();
  
  db.prepare(`
    UPDATE tasks SET status = ?, completed_at = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, completedAt, id);
  
  return getTaskById(id);
}

// Toggle pin status
function togglePin(id) {
  const db = getDatabase();
  const task = db.prepare('SELECT is_pinned FROM tasks WHERE id = ?').get(id);
  
  if (!task) return null;
  
  const newPinned = task.is_pinned ? 0 : 1;
  db.prepare(`UPDATE tasks SET is_pinned = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(newPinned, id);
  
  return getTaskById(id);
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  togglePin
};
