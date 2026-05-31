const db = require('../db/connection');

const Task = {
  getAll(boardId) {
    const query = boardId
      ? 'SELECT * FROM tasks WHERE deleted_at IS NULL AND board_id = ? ORDER BY pinned DESC, position'
      : 'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY pinned DESC, position';
    return boardId ? db.prepare(query).all(boardId) : db.prepare(query).all();
  },

  search(keyword, boardId) {
    const like = `%${keyword}%`;
    if (boardId) {
      return db.prepare(
        'SELECT * FROM tasks WHERE deleted_at IS NULL AND board_id = ? AND (title LIKE ? OR description LIKE ?) ORDER BY pinned DESC, position'
      ).all(boardId, like, like);
    }
    return db.prepare(
      'SELECT * FROM tasks WHERE deleted_at IS NULL AND (title LIKE ? OR description LIKE ?) ORDER BY pinned DESC, position'
    ).all(like, like);
  },

  getDeleted(boardId) {
    if (boardId) {
      return db.prepare('SELECT * FROM tasks WHERE deleted_at IS NOT NULL AND board_id = ? ORDER BY updated_at DESC').all(boardId);
    }
    return db.prepare('SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY updated_at DESC').all();
  },

  togglePin(id) {
    const task = this.getById(id);
    db.prepare('UPDATE tasks SET pinned = ? WHERE id = ?').run(task.pinned ? 0 : 1, id);
    return this.getById(id);
  },

  getById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  create({ title, description, board_id, priority, due_date, color }) {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, board_id, priority, due_date, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description || '', board_id || 1, priority || 'medium', due_date || null, color || null);
    return this.getById(result.lastInsertRowid);
  },

  update(id, { title, description, priority, due_date, color }) {
    db.prepare(`
      UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, color = ?,
      updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(title, description || '', priority || 'medium', due_date || null, color || null, id);
    return this.getById(id);
  },

  remove(id) {
    // 软删除
    return db.prepare("UPDATE tasks SET deleted_at = datetime('now','localtime') WHERE id = ?").run(id);
  },

  restore(id) {
    return db.prepare("UPDATE tasks SET deleted_at = NULL, updated_at = datetime('now','localtime') WHERE id = ?").run(id);
  },

  permanentDelete(id) {
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },

  move(id, status, position) {
    db.prepare(`
      UPDATE tasks SET status = ?, position = ?, updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(status, position, id);
    return this.getById(id);
  },
};

module.exports = Task;
