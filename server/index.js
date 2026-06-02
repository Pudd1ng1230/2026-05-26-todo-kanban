/**
 * Todo Kanban — Express 应用入口
 *
 * 职责：
 * 1. 创建 Express 实例并监听端口（默认 3001，可通过 PORT 环境变量覆盖）
 * 2. 注册全局中间件（express.json、静态文件服务）
 * 3. 挂载各资源路由到 /api 前缀下
 * 4. 生产环境托管前端构建产物（client/dist），支持 SPA fallback
 *
 * 路由挂载点（按优先级排序）：
 *   /api/boards            — 板块 CRUD
 *   /api/tasks             — 任务 CRUD + 移动 + 置顶
 *   /api/tasks/:taskId/subtasks   — 子任务 CRUD
 *   /api/tasks/:taskId/attachments — 附件上传/删除
 *   /api/tasks/:taskId/timer      — 计时器读写
 *   /uploads               — 上传的附件（静态文件）
 *   /*                     — SPA fallback → client/dist/index.html（仅生产模式）
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ── CORS — 跨域资源共享 ──
// 开发环境允许 Vite dev server (5173)；生产环境允许同源或 CORS_ORIGIN 环境变量
const corsOrigin = process.env.CORS_ORIGIN || (isProduction ? true : 'http://localhost:5173');
app.use(cors({ origin: corsOrigin, credentials: true }));

// ── 请求日志 ──
// dev 格式：简洁彩色输出；combined 格式：标准 Apache 日志（含 IP/UA/响应时间）
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.use(express.json());

// ── API 限流 — 每个 IP 每分钟最多 100 次请求 ──
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 分钟窗口
  max: 100,              // 最多 100 次
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' },
});
app.use('/api', apiLimiter);

// ── 健康检查（无需认证，供监控/负载均衡使用） ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── API 认证（未设置 API_KEY 环境变量时自动跳过） ──
app.use('/api', require('./middleware/auth'));

// ── API 路由（必须在静态文件之前） ──
app.use('/api/boards', require('./routes/boards'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tasks/:taskId/subtasks', require('./routes/subtasks'));
app.use('/api/tasks/:taskId/attachments', require('./routes/attachments'));
app.use('/api/tasks/:taskId/timer', require('./routes/timer'));

// ── 静态文件：上传的附件 ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── 生产模式：托管前端构建产物 ──
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  if (fs.existsSync(distPath)) {
    // 静态资源（JS/CSS/图片等）
    app.use(express.static(distPath));
    // SPA fallback：所有非 API/非 uploads 的 GET 请求返回 index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[prod] Serving static files from ${distPath}`);
  } else {
    console.warn(`[prod] WARNING: ${distPath} not found — run "npm run build" first`);
  }
}

// ── 全局错误处理（必须放在所有路由之后） ──
// 捕获：multer 文件类型错误、数据库异常、其他未处理异常
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // multer 文件类型/大小错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '文件大小超过 10MB 限制' });
  }
  if (err.message && err.message.startsWith('不支持的文件类型')) {
    return res.status(400).json({ error: err.message });
  }
  // 其他错误：生产环境不暴露详细信息
  console.error(`[error] ${err.message}`, isProduction ? '' : err.stack);
  res.status(err.status || 500).json({
    error: isProduction ? '服务器内部错误' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} [${isProduction ? 'production' : 'development'}]`);
});
