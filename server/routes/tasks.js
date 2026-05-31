/**
 * 任务路由 — 挂载于 /api/tasks
 *
 * GET    /                        → 任务列表（支持 ?board_id=&search=&deleted=）
 * GET    /:id                     → 单个任务
 * POST   /                        → 创建任务
 * PUT    /:id                     → 更新任务
 * DELETE /:id                     → 软删除
 * PATCH  /:id/move                → 拖拽移动
 * PATCH  /:id/restore             → 从回收站恢复
 * PATCH  /:id/pin                 → 切换置顶
 * DELETE /:id/permanent           → 彻底删除
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/move', ctrl.move);
router.patch('/:id/restore', ctrl.restore);
router.patch('/:id/pin', ctrl.togglePin);
router.delete('/:id/permanent', ctrl.permanentDelete);

module.exports = router;
