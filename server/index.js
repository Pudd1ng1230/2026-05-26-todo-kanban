/**
 * Todo Kanban — Express 应用入口
 *
 * 职责：
 * 1. 创建 Express 实例并监听 3001 端口
 * 2. 注册全局中间件（express.json、静态文件服务）
 * 3. 挂载各资源路由到 /api 前缀下
 *
 * 路由挂载点：
 *   /api/boards            — 板块 CRUD
 *   /api/tasks             — 任务 CRUD + 移动 + 置顶
 *   /api/tasks/:taskId/subtasks   — 子任务 CRUD
 *   /api/tasks/:taskId/attachments — 附件上传/删除
 *   /api/tasks/:taskId/timer      — 计时器读写
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());

// 静态文件：上传的附件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/boards', require('./routes/boards'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tasks/:taskId/subtasks', require('./routes/subtasks'));
app.use('/api/tasks/:taskId/attachments', require('./routes/attachments'));
app.use('/api/tasks/:taskId/timer', require('./routes/timer'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
