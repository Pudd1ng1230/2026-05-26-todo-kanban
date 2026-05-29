const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const attachmentController = {
  upload: upload.single('file'),

  getByTask(req, res) {
    const attachments = db.prepare('SELECT * FROM attachments WHERE task_id = ? ORDER BY created_at DESC')
      .all(Number(req.params.taskId));
    res.json(attachments);
  },

  create(req, res) {
    if (!req.file) return res.status(400).json({ error: '请选择文件' });
    const result = db.prepare(
      'INSERT INTO attachments (task_id, filename, original_name, size) VALUES (?, ?, ?, ?)'
    ).run(Number(req.params.taskId), req.file.filename, req.file.originalname, req.file.size);
    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(attachment);
  },

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
