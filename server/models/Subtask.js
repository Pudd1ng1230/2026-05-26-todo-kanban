const db = require('../db/connection');

const Subtask = {
  getByTask(taskId) {
    return db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position').all(taskId);
  },
  create(taskId, title) {
    const maxPos = db.prepare('SELECT MAX(position) as m FROM subtasks WHERE task_id = ?').get(taskId);
    const pos = (maxPos?.m ?? -1) + 1;
    const result = db.prepare('INSERT INTO subtasks (task_id, title, position) VALUES (?, ?, ?)').run(taskId, title, pos);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
  },
  toggle(id) {
    const sub = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(sub.completed ? 0 : 1, id);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  },
  update(id, title) {
    db.prepare('UPDATE subtasks SET title = ? WHERE id = ?').run(title, id);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  },
  remove(id) {
    return db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
  },
};

module.exports = Subtask;
