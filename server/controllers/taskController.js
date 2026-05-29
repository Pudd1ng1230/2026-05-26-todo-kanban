const Task = require('../models/Task');

const taskController = {
  getAll(req, res) {
    const { board_id, search, deleted } = req.query;
    if (deleted === 'true') {
      return res.json(Task.getDeleted(board_id ? Number(board_id) : null));
    }
    if (search) {
      return res.json(Task.search(search, board_id ? Number(board_id) : null));
    }
    res.json(Task.getAll(board_id ? Number(board_id) : null));
  },

  getById(req, res) {
    const task = Task.getById(Number(req.params.id));
    if (!task) return res.status(404).json({ error: '任务不存在' });
    res.json(task);
  },

  create(req, res) {
    const { title, description, board_id, priority, due_date, color } = req.body;
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    const task = Task.create({ title, description, board_id, priority, due_date, color });
    res.status(201).json(task);
  },

  update(req, res) {
    const { title, description, priority, due_date, color } = req.body;
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    const task = Task.update(Number(req.params.id), { title, description, priority, due_date, color });
    res.json(task);
  },

  remove(req, res) {
    Task.remove(Number(req.params.id));
    res.json({ success: true });
  },

  restore(req, res) {
    Task.restore(Number(req.params.id));
    res.json({ success: true });
  },

  permanentDelete(req, res) {
    Task.permanentDelete(Number(req.params.id));
    res.json({ success: true });
  },

  move(req, res) {
    const { status, position } = req.body;
    const task = Task.move(Number(req.params.id), status, position);
    res.json(task);
  },
};

module.exports = taskController;
