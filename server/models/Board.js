/**
 * Board Model — 板块数据操作
 *
 * 每个板块（Board）是一个独立的三列看板，任务通过 tasks.board_id 关联。
 * 数据库首次初始化时会自动创建"默认看板"。
 */

const db = require('../db/connection');

const Board = {
  /** 获取所有板块，按创建时间排序 */
  getAll() {
    return db.prepare('SELECT * FROM boards ORDER BY created_at').all();
  },

  /** 按 ID 获取单个板块 */
  getById(id) {
    return db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
  },

  /**
   * 创建新板块
   * @param {string} name — 板块名称
   * @returns {object} 新创建的板块对象
   */
  create(name) {
    const result = db.prepare('INSERT INTO boards (name) VALUES (?)').run(name);
    return this.getById(result.lastInsertRowid);
  },

  /**
   * 更新板块名称
   * @param {number} id
   * @param {string} name — 新名称
   * @returns {object} 更新后的板块对象
   */
  update(id, name) {
    db.prepare('UPDATE boards SET name = ? WHERE id = ?').run(name, id);
    return this.getById(id);
  },

  /**
   * 删除板块（硬删除）
   * 注意：关联的任务会因外键 CASCADE 而被级联删除
   * @param {number} id
   */
  remove(id) {
    return db.prepare('DELETE FROM boards WHERE id = ?').run(id);
  },
};

module.exports = Board;
