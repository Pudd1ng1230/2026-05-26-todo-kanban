/**
 * Attachment Model — 附件数据访问层
 *
 * 职责：封装 attachments 表的所有数据库操作。
 * 这是 P2 重构的一部分 — 将原本直接写在 controller 中的 SQL 提取到 Model 层，
 * 保持与项目其他模块（Task/Board/Subtask/Timer）一致的 MVC 架构。
 *
 * 表结构（attachments）：
 *   id            INTEGER PK  自增主键
 *   task_id       INTEGER FK  关联任务（CASCADE 删除）
 *   filename      TEXT        存储文件名（时间戳+随机数）
 *   original_name TEXT        原始文件名
 *   size          INTEGER     文件大小（字节）
 *   created_at    TEXT        上传时间
 */

const db = require('../db/connection');

const Attachment = {
  /** 获取某任务的所有附件（按上传时间倒序） */
  findByTaskId(taskId) {
    return db.prepare(
      'SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at DESC'
    ).all(Number(taskId));
  },

  /** 根据 ID 查找单个附件 */
  findById(id) {
    return db.prepare('SELECT * FROM attachments WHERE id = ?').get(Number(id));
  },

  /** 创建附件记录，返回完整对象 */
  create(taskId, filename, originalName, size) {
    const result = db.prepare(
      'INSERT INTO attachments (task_id, filename, original_name, size) VALUES (?, ?, ?, ?)'
    ).run(Number(taskId), filename, originalName, size);
    return this.findById(result.lastInsertRowid);
  },

  /** 删除附件记录（不删除磁盘文件 — 由 controller 负责） */
  remove(id) {
    return db.prepare('DELETE FROM attachments WHERE id = ?').run(Number(id));
  },
};

module.exports = Attachment;
