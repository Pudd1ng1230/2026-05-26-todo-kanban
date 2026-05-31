/**
 * 子任务路由 — 挂载于 /api/tasks/:taskId/subtasks
 *
 * mergeParams: true 使这里能访问父路由的 :taskId 参数
 *
 * GET    /               → 某任务的所有子任务
 * POST   /               → 创建子任务
 * PATCH  /:id/toggle     → 切换完成状态
 * PUT    /:id            → 修改标题
 * DELETE /:id            → 删除子任务
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/subtaskController');

router.get('/', ctrl.getByTask);
router.post('/', ctrl.create);
router.patch('/:id/toggle', ctrl.toggle);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
