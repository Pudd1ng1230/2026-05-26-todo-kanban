/**
 * 板块路由 — 挂载于 /api/boards
 *
 * GET    /      → 所有板块
 * POST   /      → 创建板块
 * PUT    /:id   → 更新板块名称
 * DELETE /:id   → 删除板块
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/boardController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
