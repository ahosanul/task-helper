const { getDatabase } = require('../db/connection');

// GET all tags
function getAllTags() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tags ORDER BY name').all();
}

// POST create new tag
function createTag({ id, name, color }) {
  const db = getDatabase();
  db.prepare(`INSERT INTO tags (id, name, color) VALUES (?, ?, ?)`).run(id, name, color);
  return getTagById(id);
}

// GET single tag
function getTagById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

// DELETE tag
function deleteTag(id) {
  const db = getDatabase();
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  return true;
}

// POST add tag to task
function addToTask(taskId, tagId) {
  const db = getDatabase();
  try {
    db.prepare(`INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)`).run(taskId, tagId);
    return getTagsForTask(taskId);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return getTagsForTask(taskId); // Already exists
    }
    throw error;
  }
}

// DELETE tag from task
function removeFromTask(taskId, tagId) {
  const db = getDatabase();
  db.prepare(`DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?`).run(taskId, tagId);
  return getTagsForTask(taskId);
}

// GET tags for a task
function getTagsForTask(taskId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT tg.* FROM tags tg
    JOIN task_tags tt ON tg.id = tt.tag_id
    WHERE tt.task_id = ?
  `).all(taskId);
}

module.exports = {
  getAllTags,
  createTag,
  getTagById,
  deleteTag,
  addToTask,
  removeFromTask,
  getTagsForTask
};
