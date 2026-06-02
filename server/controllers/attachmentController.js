/**
 * Attachment Controller — 附件上传/查询/删除
 *
 * 使用 multer 处理 multipart/form-data 文件上传。
 * 文件存储到 server/uploads/，文件名用时间戳+随机数防碰撞。
 * 文件大小限制 10MB，类型白名单限制。
 *
 * 数据访问通过 Attachment Model（遵循 MVC 分层）。
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment');

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

// 允许的文件类型白名单
const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/msword',                                                           // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',      // .docx
  'application/vnd.ms-excel',                                                     // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',            // .xlsx
  'application/zip', 'application/x-7z-compressed',
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}。允许的类型: 图片/PDF/文档/压缩包`));
    },
  },
});

const attachmentController = {
  // multer 中间件：处理单文件上传（字段名 "file"）
  upload: upload.single('file'),

  /** GET /api/tasks/:taskId/attachments — 获取某任务的所有附件 */
  getByTask(req, res) {
    const attachments = Attachment.findByTaskId(req.params.taskId);
    res.json(attachments);
  },

  /**
   * POST /api/tasks/:taskId/attachments — 上传文件
   * 先经过 upload 中间件处理文件，再写入 attachments 表
   */
  /**
   * POST /api/tasks/:taskId/attachments — 上传文件
   * 先经过 upload 中间件处理文件，再通过 Model 写入数据库
   */
  create(req, res, next) {
    if (!req.file) {
      return res.status(400).json({ error: '请选择文件' });
    }
    try {
      const attachment = Attachment.create(
        req.params.taskId,
        req.file.filename,
        req.file.originalname,
        req.file.size
      );
      res.status(201).json(attachment);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tasks/:taskId/attachments/:id — 删除附件
   * 先查记录 → 删磁盘文件 → 删数据库记录
   */
  remove(req, res) {
    const attachment = Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).json({ error: '附件不存在' });

    // 删除磁盘文件（不阻塞 — 文件可能已被手动删除）
    const filePath = path.join(uploadsDir, attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    Attachment.remove(req.params.id);
    res.json({ success: true });
  },
};

module.exports = attachmentController;
