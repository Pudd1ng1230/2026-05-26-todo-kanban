const Board = require('../models/Board');

const boardController = {
  getAll(req, res) {
    res.json(Board.getAll());
  },
  create(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '板块名称不能为空' });
    res.status(201).json(Board.create(name));
  },
  update(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '板块名称不能为空' });
    res.json(Board.update(Number(req.params.id), name));
  },
  remove(req, res) {
    Board.remove(Number(req.params.id));
    res.json({ success: true });
  },
};

module.exports = boardController;
