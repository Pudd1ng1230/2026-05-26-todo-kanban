const Subtask = require('../models/Subtask');

const subtaskController = {
  getByTask(req, res) {
    res.json(Subtask.getByTask(Number(req.params.taskId)));
  },
  create(req, res) {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: '子任务标题不能为空' });
    res.status(201).json(Subtask.create(Number(req.params.taskId), title));
  },
  toggle(req, res) {
    res.json(Subtask.toggle(Number(req.params.id)));
  },
  update(req, res) {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    res.json(Subtask.update(Number(req.params.id), title));
  },
  remove(req, res) {
    Subtask.remove(Number(req.params.id));
    res.json({ success: true });
  },
};

module.exports = subtaskController;
