const Task = require('../models/Task');

const taskController = {
  getAll(req, res) {
    const tasks = Task.getAll();
    res.json(tasks);
  },

  getById(req, res) {
    const task = Task.getById(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json(task);
  },

  create(req, res) {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    const task = Task.create(title, description || '');
    res.status(201).json(task);
  },

  update(req, res) {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    const task = Task.update(Number(req.params.id), title, description || '');
    res.json(task);
  },

  remove(req, res) {
    Task.remove(Number(req.params.id));
    res.json({ success: true });
  },

  move(req, res) {
    const { status, position } = req.body;
    const task = Task.move(Number(req.params.id), status, position);
    res.json(task);
  },
};

module.exports = taskController;
