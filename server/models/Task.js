/**
 * Task Model — 任务卡片数据操作
 *
 * 这是项目的核心 Model，涵盖任务的全部生命周期：
 * CRUD、搜索、软删除/恢复/彻底删除、拖拽移动、置顶切换。
 *
 * 排序规则：pinned DESC（置顶优先）→ position ASC（同状态内按位置排序）。
 * 软删除机制：remove 只设 deleted_at，不真正删行；restore 清除 deleted_at。
 */

const db = require('../db/connection');

const Task = {
  /**
   * 获取未删除的任务列表
   * @param {number} [boardId] — 可选，筛选指定板块的任务
   * @returns {Array} 任务数组，置顶优先，按 position 排序
   */
  getAll(boardId) {
    const query = boardId
      ? 'SELECT * FROM tasks WHERE deleted_at IS NULL AND board_id = ? ORDER BY pinned DESC, position'
      : 'SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY pinned DESC, position';
    return boardId ? db.prepare(query).all(boardId) : db.prepare(query).all();
  },

  /**
   * 关键字搜索（模糊匹配 title 和 description）
   * @param {string} keyword — 搜索关键字
   * @param {number} [boardId] — 可选，限定板块范围
   * @returns {Array} 匹配的任务数组
   */
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

  /**
   * 获取回收站中的任务（deleted_at IS NOT NULL）
   * @param {number} [boardId]
   * @returns {Array}
   */
  getDeleted(boardId) {
    if (boardId) {
      return db.prepare('SELECT * FROM tasks WHERE deleted_at IS NOT NULL AND board_id = ? ORDER BY updated_at DESC').all(boardId);
    }
    return db.prepare('SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY updated_at DESC').all();
  },

  /**
   * 切换置顶状态（0 ↔ 1）
   * @param {number} id
   * @returns {object} 更新后的任务对象
   */
  togglePin(id) {
    const task = this.getById(id);
    db.prepare('UPDATE tasks SET pinned = ? WHERE id = ?').run(task.pinned ? 0 : 1, id);
    return this.getById(id);
  },

  /** 按 ID 获取单个任务 */
  getById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },

  /**
   * 创建新任务
   * @param {object} params
   * @param {string} params.title — 标题（必填）
   * @param {string} [params.description] — 描述
   * @param {number} [params.board_id=1] — 所属板块
   * @param {string} [params.priority='medium'] — 优先级 high/medium/low
   * @param {string} [params.due_date] — 截止日期 YYYY-MM-DD
   * @param {string} [params.color] — 卡片颜色 hex
   * @returns {object} 新创建的任务对象
   */
  create({ title, description, board_id, priority, due_date, color }) {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, board_id, priority, due_date, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description || '', board_id || 1, priority || 'medium', due_date || null, color || null);
    return this.getById(result.lastInsertRowid);
  },

  /**
   * 更新任务（标题、描述、优先级、截止日期、颜色）
   * 自动刷新 updated_at 时间戳
   * @param {number} id
   * @param {object} params
   * @returns {object} 更新后的任务对象
   */
  update(id, { title, description, priority, due_date, color }) {
    db.prepare(`
      UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, color = ?,
      updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(title, description || '', priority || 'medium', due_date || null, color || null, id);
    return this.getById(id);
  },

  /**
   * 软删除：设置 deleted_at 时间戳，不真正删除数据
   * @param {number} id
   */
  remove(id) {
    return db.prepare("UPDATE tasks SET deleted_at = datetime('now','localtime') WHERE id = ?").run(id);
  },

  /**
   * 从回收站恢复：清除 deleted_at
   * @param {number} id
   */
  restore(id) {
    return db.prepare("UPDATE tasks SET deleted_at = NULL, updated_at = datetime('now','localtime') WHERE id = ?").run(id);
  },

  /**
   * 彻底删除（不可恢复）
   * @param {number} id
   */
  permanentDelete(id) {
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },

  /**
   * 拖拽移动：更新状态和排序位置
   * 注意：不修改 pinned 字段 — 置顶状态由用户手动控制（togglePin）
   * @param {number} id
   * @param {string} status — 新状态 todo / in-progress / done
   * @param {number} position — 在目标列中的位置
   * @returns {object} 更新后的任务对象
   */
  move(id, status, position) {
    db.prepare(`
      UPDATE tasks SET status = ?, position = ?, updated_at = datetime('now','localtime')
      WHERE id = ?
    `).run(status, position, id);
    return this.getById(id);
  },
};

module.exports = Task;
