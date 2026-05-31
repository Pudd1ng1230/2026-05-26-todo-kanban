/**
 * Subtask Model — 子任务数据操作
 *
 * 子任务属于某个任务卡片（task_id 外键关联 tasks.id）。
 * 每个子任务有独立的 completed 状态和排序位置（position）。
 */

const db = require('../db/connection');

const Subtask = {
  /** 获取某个任务的所有子任务，按 position 排序 */
  getByTask(taskId) {
    return db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position').all(taskId);
  },

  /**
   * 创建子任务
   * position 自动取当前最大 position + 1，插入到末尾
   * @param {number} taskId — 所属任务 ID
   * @param {string} title — 子任务标题
   * @returns {object} 新创建的子任务对象
   */
  create(taskId, title) {
    const maxPos = db.prepare('SELECT MAX(position) as m FROM subtasks WHERE task_id = ?').get(taskId);
    const pos = (maxPos?.m ?? -1) + 1;
    const result = db.prepare('INSERT INTO subtasks (task_id, title, position) VALUES (?, ?, ?)').run(taskId, title, pos);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
  },

  /**
   * 切换子任务完成状态（0 ↔ 1）
   * @param {number} id — 子任务 ID
   * @returns {object} 更新后的子任务对象
   */
  toggle(id) {
    const sub = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
    db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(sub.completed ? 0 : 1, id);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  },

  /**
   * 修改子任务标题
   * @param {number} id
   * @param {string} title — 新标题
   * @returns {object} 更新后的子任务对象
   */
  update(id, title) {
    db.prepare('UPDATE subtasks SET title = ? WHERE id = ?').run(title, id);
    return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  },

  /**
   * 删除子任务
   * @param {number} id
   */
  remove(id) {
    return db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
  },
};

module.exports = Subtask;
