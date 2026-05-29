const Timer = require('../models/Timer');

const timerController = {
  getTotal(req, res) {
    const total = Timer.getTotal(Number(req.params.taskId));
    res.json({ total });
  },
  save(req, res) {
    const { duration } = req.body;
    Timer.addDuration(Number(req.params.taskId), duration || 0);
    const total = Timer.getTotal(Number(req.params.taskId));
    res.json({ total });
  },
};

module.exports = timerController;
