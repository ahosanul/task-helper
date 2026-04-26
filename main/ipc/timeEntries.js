const { getDatabase } = require('../db/connection');

// GET all time entries for a task
function getTimeEntriesForTask(taskId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM time_entries 
    WHERE task_id = ? 
    ORDER BY started_at DESC
  `).all(taskId);
}

// POST create new time entry
function createTimeEntry(entryData) {
  const db = getDatabase();
  const { id, taskId, startedAt, endedAt, autoDetectedSeconds, loggedMinutes, comment } = entryData;
  
  const stmt = db.prepare(`
    INSERT INTO time_entries (id, task_id, started_at, ended_at, auto_detected_seconds, logged_minutes, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, taskId, startedAt, endedAt || null, autoDetectedSeconds || 0, loggedMinutes || 0, comment || null);
  
  return getTimeEntriesForTask(taskId);
}

// PUT update time entry
function updateTimeEntry(id, fields) {
  const db = getDatabase();
  const allowedFields = ['logged_minutes', 'comment'];
  
  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(fields)) {
    const dbCol = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbCol)) {
      updates.push(`${dbCol} = ?`);
      values.push(value);
    }
  }
  
  if (updates.length === 0) return null;
  
  values.push(id);
  db.prepare(`UPDATE time_entries SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  
  const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id);
  return entry ? getTimeEntriesForTask(entry.task_id) : null;
}

// DELETE time entry
function deleteTimeEntry(id) {
  const db = getDatabase();
  const entry = db.prepare('SELECT task_id FROM time_entries WHERE id = ?').get(id);
  if (!entry) return null;
  
  db.prepare('DELETE FROM time_entries WHERE id = ?').run(id);
  return getTimeEntriesForTask(entry.task_id);
}

module.exports = {
  getTimeEntriesForTask,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
};
