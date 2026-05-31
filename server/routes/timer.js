/**
 * 计时器路由 — 挂载于 /api/tasks/:taskId/timer
 *
 * GET  /  → 获取累计计时（秒）
 * POST /  → 保存本次计时 duration，返回更新后的累计 total
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/timerController');

router.get('/', ctrl.getTotal);
router.post('/', ctrl.save);

module.exports = router;
