const db = require('../db/connection');

const Timer = {
  getTotal(taskId) {
    const row = db.prepare('SELECT COALESCE(SUM(duration), 0) as total FROM timer_sessions WHERE task_id = ?').get(taskId);
    return row.total;
  },
  getSessions(taskId) {
    return db.prepare('SELECT * FROM timer_sessions WHERE task_id = ? ORDER BY start_time DESC').all(taskId);
  },
  start(taskId) {
    const result = db.prepare('INSERT INTO timer_sessions (task_id) VALUES (?)').run(taskId);
    return db.prepare('SELECT * FROM timer_sessions WHERE id = ?').get(result.lastInsertRowid);
  },
  stop(sessionId, duration) {
    db.prepare("UPDATE timer_sessions SET end_time = datetime('now','localtime'), duration = ? WHERE id = ?")
      .run(duration, sessionId);
    return db.prepare('SELECT * FROM timer_sessions WHERE id = ?').get(sessionId);
  },
  addDuration(taskId, seconds) {
    // 直接追加一条记录
    const result = db.prepare(
      "INSERT INTO timer_sessions (task_id, start_time, end_time, duration) VALUES (?, datetime('now','localtime'), datetime('now','localtime'), ?)"
    ).run(taskId, seconds);
    return result;
  },
};

module.exports = Timer;
