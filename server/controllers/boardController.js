/**
 * Board Controller — 板块接口的业务逻辑
 */

const Board = require('../models/Board');

const boardController = {
  /** GET /api/boards — 获取所有板块 */
  getAll(req, res) {
    res.json(Board.getAll());
  },

  /** POST /api/boards — 创建板块，name 必填 */
  create(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '板块名称不能为空' });
    res.status(201).json(Board.create(name));
  },

  /** PUT /api/boards/:id — 更新板块名称 */
  update(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: '板块名称不能为空' });
    res.json(Board.update(Number(req.params.id), name));
  },

  /** DELETE /api/boards/:id — 删除板块（关联任务级联删除） */
  remove(req, res) {
    Board.remove(Number(req.params.id));
    res.json({ success: true });
  },
};

module.exports = boardController;
