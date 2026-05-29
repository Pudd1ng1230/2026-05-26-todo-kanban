const db = require('../db/connection');

const Board = {
  getAll() {
    return db.prepare('SELECT * FROM boards ORDER BY created_at').all();
  },
  getById(id) {
    return db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
  },
  create(name) {
    const result = db.prepare('INSERT INTO boards (name) VALUES (?)').run(name);
    return this.getById(result.lastInsertRowid);
  },
  update(id, name) {
    db.prepare('UPDATE boards SET name = ? WHERE id = ?').run(name, id);
    return this.getById(id);
  },
  remove(id) {
    return db.prepare('DELETE FROM boards WHERE id = ?').run(id);
  },
};

module.exports = Board;
