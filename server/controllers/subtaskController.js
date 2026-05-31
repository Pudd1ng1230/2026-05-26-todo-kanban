/**
 * Subtask Controller — 子任务接口的业务逻辑
 */

const Subtask = require('../models/Subtask');

const subtaskController = {
  /** GET /api/tasks/:taskId/subtasks — 获取某任务的所有子任务 */
  getByTask(req, res) {
    res.json(Subtask.getByTask(Number(req.params.taskId)));
  },

  /** POST /api/tasks/:taskId/subtasks — 创建子任务 */
  create(req, res) {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: '子任务标题不能为空' });
    res.status(201).json(Subtask.create(Number(req.params.taskId), title));
  },

  /** PATCH /api/tasks/:taskId/subtasks/:id/toggle — 切换完成状态 */
  toggle(req, res) {
    res.json(Subtask.toggle(Number(req.params.id)));
  },

  /** PUT /api/tasks/:taskId/subtasks/:id — 修改子任务标题 */
  update(req, res) {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: '标题不能为空' });
    res.json(Subtask.update(Number(req.params.id), title));
  },

  /** DELETE /api/tasks/:taskId/subtasks/:id — 删除子任务 */
  remove(req, res) {
    Subtask.remove(Number(req.params.id));
    res.json({ success: true });
  },
};

module.exports = subtaskController;
