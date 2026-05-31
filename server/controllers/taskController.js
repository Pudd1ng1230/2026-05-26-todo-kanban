/**
 * Task Controller — 任务接口的业务逻辑
 *
 * 每个方法对应一个 API 端点，职责：
 * 1. 从 req 提取参数并做基本验证
 * 2. 调用 Task Model 执行数据库操作
 * 3. 返回 JSON 响应 + 合适的 HTTP 状态码
 */

const Task = require('../models/Task');

const taskController = {
  /**
   * GET /api/tasks?board_id=&search=&deleted=
   * 三合一查询入口：deleted=true → 回收站，search=xx → 搜索，否则 → 任务列表
   */
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

  /** GET /api/tasks/:id — 获取单个任务 */
  getById(req, res) {
    const task = Task.getById(Number(req.params.id));
    if (!task) return res.status(404).json({ error: '任务不存在' });
    res.json(task);
  },

  /** POST /api/tasks — 创建新任务，title 必填 */
  create(req, res) {
    const { title, description, board_id, priority, due_date, color } = req.body;
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    const task = Task.create({ title, description, board_id, priority, due_date, color });
    res.status(201).json(task);
  },

  /** PUT /api/tasks/:id — 更新任务，title 必填 */
  update(req, res) {
    const { title, description, priority, due_date, color } = req.body;
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    const task = Task.update(Number(req.params.id), { title, description, priority, due_date, color });
    res.json(task);
  },

  /** DELETE /api/tasks/:id — 软删除（移入回收站） */
  remove(req, res) {
    Task.remove(Number(req.params.id));
    res.json({ success: true });
  },

  /** PATCH /api/tasks/:id/restore — 从回收站恢复 */
  restore(req, res) {
    Task.restore(Number(req.params.id));
    res.json({ success: true });
  },

  /** DELETE /api/tasks/:id/permanent — 彻底删除（不可恢复） */
  permanentDelete(req, res) {
    Task.permanentDelete(Number(req.params.id));
    res.json({ success: true });
  },

  /** PATCH /api/tasks/:id/move — 拖拽移动（改状态 + 位置） */
  move(req, res) {
    const { status, position } = req.body;
    const task = Task.move(Number(req.params.id), status, position);
    res.json(task);
  },

  /** PATCH /api/tasks/:id/pin — 切换置顶状态 */
  togglePin(req, res) {
    const task = Task.togglePin(Number(req.params.id));
    res.json(task);
  },
};

module.exports = taskController;
