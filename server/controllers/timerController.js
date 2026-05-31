/**
 * Timer Controller — 计时器接口的业务逻辑
 */

const Timer = require('../models/Timer');

const timerController = {
  /** GET /api/tasks/:taskId/timer — 获取累计计时（秒） */
  getTotal(req, res) {
    const total = Timer.getTotal(Number(req.params.taskId));
    res.json({ total });
  },

  /**
   * POST /api/tasks/:taskId/timer — 保存本次计时
   * body: { duration: number } — 本次计时的秒数
   * 返回更新后的累计 total
   */
  save(req, res) {
    const { duration } = req.body;
    Timer.addDuration(Number(req.params.taskId), duration || 0);
    const total = Timer.getTotal(Number(req.params.taskId));
    res.json({ total });
  },
};

module.exports = timerController;
