const db = require('../db/connection');

const Task = {
  getAll() {
    return db.prepare('SELECT * FROM tasks ORDER BY position').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  create(title, description) {
    const result = db.prepare(
      'INSERT INTO tasks (title, description) VALUES (?, ?)'
    ).run(title, description);
    return this.getById(result.lastInsertRowid);
  },

  update(id, title, description) {
    db.prepare(
      "UPDATE tasks SET title = ?, description = ?, updated_at = datetime('now','localtime') WHERE id = ?"
    ).run(title, description, id);
    return this.getById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },

  move(id, status, position) {
    db.prepare(
      "UPDATE tasks SET status = ?, position = ?, updated_at = datetime('now','localtime') WHERE id = ?"
    ).run(status, position, id);
    return this.getById(id);
  },
};

module.exports = Task;
