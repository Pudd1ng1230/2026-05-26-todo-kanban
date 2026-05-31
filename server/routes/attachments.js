/**
 * 附件路由 — 挂载于 /api/tasks/:taskId/attachments
 *
 * GET    /       → 某任务的所有附件
 * POST   /       → 上传文件（先 multer 处理，再写数据库）
 * DELETE /:id    → 删除附件（删记录 + 删文件）
 *
 * 文件访问：/api/tasks/:taskId/attachments/file/{filename}
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/attachmentController');

router.get('/', ctrl.getByTask);
router.post('/', ctrl.upload, ctrl.create);
router.delete('/:id', ctrl.remove);

// 静态文件访问：通过 URL 直接访问上传的文件
router.use('/file', express.static(require('path').join(__dirname, '..', 'uploads')));

module.exports = router;
