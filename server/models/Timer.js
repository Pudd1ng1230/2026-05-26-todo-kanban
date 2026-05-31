/**
 * Timer Model — 计时器数据操作
 *
 * 每次计时（开始→暂停）产生一条 timer_sessions 记录。
 * getTotal 汇总某任务的所有 session 的 duration，得到累计用时。
 * 前端 useTimer hook 使用 addDuration 方式：每次暂停时直接写入一条已完成记录。
 */

const db = require('../db/connection');

const Timer = {
  /**
   * 获取某个任务的累计计时（秒）
   * @param {number} taskId
   * @returns {number} 累计秒数
   */
  getTotal(taskId) {
    const row = db.prepare('SELECT COALESCE(SUM(duration), 0) as total FROM timer_sessions WHERE task_id = ?').get(taskId);
    return row.total;
  },

  /** 获取某个任务的所有计时记录，按开始时间倒序 */
  getSessions(taskId) {
    return db.prepare('SELECT * FROM timer_sessions WHERE task_id = ? ORDER BY start_time DESC').all(taskId);
  },

  /**
   * 开始计时（创建一条未结束的 session）
   * @param {number} taskId
   * @returns {object} 新 session 对象
   */
  start(taskId) {
    const result = db.prepare('INSERT INTO timer_sessions (task_id) VALUES (?)').run(taskId);
    return db.prepare('SELECT * FROM timer_sessions WHERE id = ?').get(result.lastInsertRowid);
  },

  /**
   * 结束计时（更新 session 的 end_time 和 duration）
   * @param {number} sessionId
   * @param {number} duration — 本次计时的秒数
   * @returns {object} 更新后的 session 对象
   */
  stop(sessionId, duration) {
    db.prepare("UPDATE timer_sessions SET end_time = datetime('now','localtime'), duration = ? WHERE id = ?")
      .run(duration, sessionId);
    return db.prepare('SELECT * FROM timer_sessions WHERE id = ?').get(sessionId);
  },

  /**
   * 直接追加一条已完成的计时记录（前端 useTimer 使用此方法）
   * @param {number} taskId
   * @param {number} seconds — 本次计时的秒数
   */
  addDuration(taskId, seconds) {
    const result = db.prepare(
      "INSERT INTO timer_sessions (task_id, start_time, end_time, duration) VALUES (?, datetime('now','localtime'), datetime('now','localtime'), ?)"
    ).run(taskId, seconds);
    return result;
  },
};

module.exports = Timer;
