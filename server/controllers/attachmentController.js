/**
 * Attachment Controller — 附件上传/查询/删除
 *
 * 使用 multer 处理 multipart/form-data 文件上传。
 * 文件存储到 server/uploads/，文件名用时间戳+随机数防碰撞。
 * 文件大小限制 10MB。
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');

// 上传文件存储目录
const uploadsDir = path.join(__dirname, '..', 'uploads');

// multer 配置：磁盘存储 + 唯一文件名
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const attachmentController = {
  // multer 中间件：处理单文件上传（字段名 "file"）
  upload: upload.single('file'),

  /** GET /api/tasks/:taskId/attachments — 获取某任务的所有附件 */
  getByTask(req, res) {
    const attachments = db.prepare('SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at DESC')
      .all(Number(req.params.taskId));
    res.json(attachments);
  },

  /**
   * POST /api/tasks/:taskId/attachments — 上传文件
   * 先经过 upload 中间件处理文件，再写入 attachments 表
   */
  create(req, res) {
    if (!req.file) return res.status(400).json({ error: '请选择文件' });
    const result = db.prepare(
      'INSERT INTO attachments (task_id, filename, original_name, size) VALUES (?, ?, ?, ?)'
    ).run(Number(req.params.taskId), req.file.filename, req.file.originalname, req.file.size);
    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(attachment);
  },

  /**
   * DELETE /api/tasks/:taskId/attachments/:id — 删除附件
   * 同时删除数据库记录和磁盘文件
   */
  remove(req, res) {
    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(Number(req.params.id));
    if (!attachment) return res.status(404).json({ error: '附件不存在' });
    const filePath = path.join(uploadsDir, attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM attachments WHERE id = ?').run(Number(req.params.id));
    res.json({ success: true });
  },
};

module.exports = attachmentController;
