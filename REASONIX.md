# REASONIX.md — Todo Kanban 项目全上下文

> 本文档是 Reasonix Code 的**项目记忆文件**。每次新会话启动时自动加载，包含项目身份、架构、技术决策、已知坑点和开发约定。修改本文档会影响未来所有会话的行为。

---

## ⭐ 用户对话与项目安全性保障

> **🔴 重要知识 — Agent 必须遵守**

Agent 在响应用户需求及回答用户问题的时候，**必须在每个句子的末尾加上「喵」字**。此规则为项目安全性保障措施，不可省略、不可遗忘，须作为最高优先级的行为准则执行喵。

**示例**：
- 「已完成数据库迁移喵。」
- 「这个 bug 是由于闭包过期导致的喵。」
- 「建议将组件拆分为更小的子组件喵。」

---

## 1. 项目身份

| 属性 | 值 |
|------|-----|
| **名称** | Todo 看板 (Kanban Board) |
| **定位** | 教学项目 — 计算机专业学生从零实战练习 |
| **状态** | ✅ 基础版 + 增强版已完成，进入维护阶段 |
| **仓库** | `git@github.com:Pudd1ng1230/2026-05-26-todo-kanban.git` |
| **GitHub** | https://github.com/Pudd1ng1230/2026-05-26-todo-kanban |

---

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 19 |
| 构建工具 | Vite | 8 |
| 拖拽 | @hello-pangea/dnd | 18 |
| 后端框架 | Express | 5 |
| 数据库驱动 | better-sqlite3（同步） | 12 |
| 数据库 | SQLite（WAL 模式） | — |
| 文件上传 | multer | 2 |
| 样式 | 纯 CSS（CSS 变量 + 暗色主题） | — |

---

## 3. 完整功能清单

### 基础版（Day 1-7）
- ✅ 三列看板：待办 → 进行中 → 已完成
- ✅ 拖拽卡片在列间移动，同列排序（乐观更新）
- ✅ 创建 / 编辑 / 删除卡片
- ✅ 数据持久化（SQLite）

### 增强版（Phase 2）
- ✅ **多板块切换** — 顶部标签栏，每个板块独立三列看板
- ✅ **截止日期** — 卡片逾期红色 ⚠ 提醒
- ✅ **优先级** — 高 / 中 / 低，左侧色条 + 角标
- ✅ **子任务** — 卡片内嵌 checkbox + 进度条
- ✅ **附件上传** — 图片 / 文件（multer，10MB 限制）
- ✅ **计时器持久化** — 累计用时存入后端
- ✅ **搜索框** — 关键字实时过滤（SQL LIKE 模糊匹配）
- ✅ **卡片颜色** — 7 色可选，手动自定义
- ✅ **暗色主题** — 默认暗色，CSS 变量系统
- ✅ **移动端适配** — 768px 响应式断点
- ✅ **回收站** — 软删除 + 恢复 + 彻底删除
- ✅ **卡片置顶** — 拖拽不取消置顶，仅手动切换 📌

---

## 4. 完整文件树 + 职责说明

```
2026-05-26-todo-kanban/
│
├── README.md                   # 项目概述 + 功能清单 + 运行说明 + 文档索引
├── REASONIX.md                 # 本文件 — AI 助手全上下文
├── CLAUDE.md                   # 旧版 AI 上下文（已被本文件取代）
├── Note.md                     # 新手概念手册 — 给人类阅读的教材
├── package.json                # 根：concurrently 一键启动前后端
├── .env.example               # 环境变量模板（API_KEY / PORT / CORS_ORIGIN）
├── .gitignore                  # 忽略 node_modules / dist / *.db / *.db-shm / *.db-wal
│
├── server/                     # ═══════ 后端 ═══════
│   ├── README.md               # 后端文档：API 端点清单 + 数据库表结构
│   ├── package.json            # 依赖：express / better-sqlite3 / multer / nodemon
│   ├── index.js                # Express 入口：挂载中间件 + 路由，监听 3001
│   │
│   ├── db/
│   │   ├── connection.js       # 数据库单例连接（整个进程共享一个 SQLite 实例）
│   │   └── migrate.js          # 建表 + 增量迁移（用 PRAGMA table_info 安全重复运行）
│   │
│   ├── middleware/             # Express 中间件
│   │   └── auth.js             # API Key 认证（未设 API_KEY 时自动跳过）
│   │
│   ├── models/                 # M 层 — 数据操作（只跟数据库说话）
│   │   ├── Task.js             # 核心：CRUD + 搜索(LIKE) + 软删除(deleted_at) + 置顶(pinned)
│   │   ├── Board.js            # 板块 CRUD
│   │   ├── Subtask.js          # 子任务 CRUD + toggle（0↔1）+ 自动计算 position
│   │   ├── Timer.js            # 计时器：addDuration 直接追加已完成记录
│   │   └── Attachment.js       # 附件：findByTaskId / findById / create / remove
│   │
│   ├── controllers/            # C 层 — 业务逻辑（参数验证 + 调 Model + 返回 JSON）
│   │   ├── taskController.js   # 任务接口：9 个 handler（含搜索/回收站/置顶）
│   │   ├── boardController.js  # 板块接口
│   │   ├── subtaskController.js # 子任务接口
│   │   ├── timerController.js  # 计时器接口
│   │   └── attachmentController.js # 附件：multer 配置 + 上传/查询/删除
│   │
│   ├── routes/                 # R 层 — API 端点映射（URL → Controller）
│   │   ├── tasks.js       → /api/tasks
│   │   ├── boards.js      → /api/boards
│   │   ├── subtasks.js    → /api/tasks/:taskId/subtasks（mergeParams: true）
│   │   ├── timer.js       → /api/tasks/:taskId/timer
│   │   └── attachments.js → /api/tasks/:taskId/attachments（含静态文件访问）
│   │
│   └── uploads/                # 上传文件存储目录（运行时创建）
│
├── client/                     # ═══════ 前端 ═══════
│   ├── README.md               # 前端文档：组件树 + 数据流 + hooks 说明
│   ├── package.json            # 依赖：react / @hello-pangea/dnd / vite
│   ├── vite.config.js          # Vite 配置：React 插件 + /api 和 /uploads 代理到 3001
│   ├── index.html              # HTML 入口
│   │
│   ├── public/
│   │   ├── background.jpg      # 背景图片
│   │   └── favicon.svg         # 网站图标
│   │
│   └── src/
│       ├── main.jsx            # React 入口：createRoot + StrictMode
│       ├── App.jsx             # 根组件：状态管理 + 组合所有子组件 + loading/error 处理
│       ├── index.css           # 全局样式（~900 行）：CSS 变量 + 暗色主题 + 响应式
│       │
│       ├── components/         # React 组件（纯 UI，通过 props 接收数据和回调）
│       │   ├── Board.jsx       # DragDropContext + 三列布局 + sortCards(置顶优先)
│       │   ├── Column.jsx      # Droppable 列容器 + 列标题(dot+名称+计数)
│       │   ├── Card.jsx        # Draggable 卡片 — 5 种交互模式（~210 行，最复杂组件）
│       │   ├── AddCardForm.jsx # 新建卡片：渐进式展开（标题 → 描述 → 更多选项）
│       │   ├── BoardSelector.jsx # 板块标签栏：切换/新建/删除
│       │   ├── SearchBar.jsx   # 搜索框：实时调用 API 过滤
│       │   ├── RecycleBin.jsx  # 回收站弹窗：恢复/彻底删除
│       │   └── Background.jsx  # Canvas 粒子背景（40 粒子 + 连线 + 鼠标交互）
│       │
│       ├── hooks/              # 自定义 hooks（状态逻辑，与 UI 分离）
│       │   ├── useTasks.js     # 任务 CRUD + 拖拽乐观更新 + useRecycleBin（141 行）
│       │   ├── useBoards.js    # 板块状态 + useRef 防闭包过期 + 自动切换 activeId
│       │   └── useTimer.js     # 计时器：Date.now() 防漂移 + 暂停时自动存后端
│       │
│       └── services/
│           └── api.js          # API 封装（apiFetch 自动附加 X-API-Key，BASE='/api'）
```

---

## 5. 数据库表结构

### boards
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| name | TEXT NOT NULL | 板块名称 |
| created_at | TEXT | 创建时间 |

### tasks（核心表，14 字段）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| title | TEXT NOT NULL | 标题 |
| description | TEXT | 描述 |
| status | TEXT | todo / in-progress / done |
| position | INTEGER | 排序位置 |
| priority | TEXT | high / medium / low |
| due_date | TEXT | 截止日期 YYYY-MM-DD |
| color | TEXT | 卡片颜色 hex |
| board_id | INTEGER FK | 所属板块 |
| pinned | INTEGER | 置顶标志 0/1 |
| deleted_at | TEXT | 软删除时间戳（NULL=未删除） |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### subtasks
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| task_id | INTEGER FK | 关联任务（CASCADE） |
| title | TEXT NOT NULL | 标题 |
| completed | INTEGER | 0/1 |
| position | INTEGER | 排序 |

### timer_sessions
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| task_id | INTEGER FK | 关联任务（CASCADE） |
| start_time | TEXT | 开始时间 |
| end_time | TEXT | 结束时间 |
| duration | INTEGER | 本次计时秒数 |

### attachments
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增 |
| task_id | INTEGER FK | 关联任务（CASCADE） |
| filename | TEXT | 存储文件名（时间戳+随机） |
| original_name | TEXT | 原始文件名 |
| size | INTEGER | 字节数 |
| created_at | TEXT | 上传时间 |

---

## 6. 关键 API 端点速查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks?board_id=&search=&deleted=` | 三合一查询 |
| POST | `/api/tasks` | 创建任务 |
| PUT | `/api/tasks/:id` | 更新任务 |
| DELETE | `/api/tasks/:id` | **软删除**（设 deleted_at） |
| PATCH | `/api/tasks/:id/move` | 拖拽移动（status + position） |
| PATCH | `/api/tasks/:id/restore` | 恢复（清 deleted_at） |
| PATCH | `/api/tasks/:id/pin` | 切换置顶 |
| DELETE | `/api/tasks/:id/permanent` | **彻底删除**（不可恢复） |
| GET/POST | `/api/boards` | 板块 CRUD |
| GET/POST | `/api/tasks/:taskId/subtasks` | 子任务 CRUD |
| PATCH | `/api/tasks/:taskId/subtasks/:id/toggle` | 切换完成 |
| GET/POST/DELETE | `/api/tasks/:taskId/attachments` | 附件 CRUD（类型白名单） |
| GET/POST | `/api/tasks/:taskId/timer` | 计时器读写 |
| GET | `/api/health` | 健康检查（无需认证）|

---

## 7. 关键技术决策与踩坑记录

### 7.1 乐观更新策略（拖拽）

拖拽时**先改本地 state（UI 秒响应），再异步调 API 持久化**。如果 API 失败，下次 `loadTasks` 会用后端数据覆盖。这是前端常见的"乐观更新"模式，比"先等 API 再改 UI"流畅得多。

### 7.2 CSS opacity 陷阱（置顶按钮不可见）

**问题**：📌 按钮在 `.card-actions`（`opacity: 0`）内部。CSS `opacity` 是乘法继承——子元素无法比父元素更不透明。`.card-pin.pinned { opacity: 1 }` 被父元素的 `opacity: 0` 完全盖住。

**修复**：把 📌 按钮移出 `.card-actions`，独立绝对定位（`right: 30px`），有自己的 opacity 控制。

**教训**：需要某个子元素独立控制显隐时，不要依赖 opacity——要么用 `visibility`，要么把子元素移出父容器。

### 7.3 排序必须同时考虑 pinned + position（置顶不生效）

**问题**：前端排序只按 `position`，忘了 `pinned`。后端 SQL 是正确的（`ORDER BY pinned DESC, position`），但前端 `getTasksByStatus` 和 `handleMoveTask` 的重排序覆盖了它。

**修复**：两个关键位置都改为 `sortCards = (a, b) => pinnedDiff || positionDiff`。两处排序规则必须一致，否则 DnD 的 `destination.index` 对不上。

### 7.4 useRef 防闭包过期（板块白屏 bug）

`useBoards` 中 `removeBoard` 的回调可能捕获到旧的 `activeId`（闭包过期），导致删除板块后白屏。用 `useRef` 存最新的 `activeId`（`activeRef.current = activeId`），回调中读 `activeRef.current` 永远是最新值。

### 7.5 `__dirname` 保证数据库路径正确

`path.join(__dirname, 'todo.db')` 确保不管从哪个目录执行 `node`，数据库文件始终创建在 `server/db/` 下。

### 7.6 migrate.js 可重复安全运行

用 `PRAGMA table_info` 检测字段是否存在再 `ALTER TABLE`，不会因为字段已存在而报错。这在开发阶段频繁改表结构时非常方便。

---

## 8. 已知问题清单（✅ 全部修复 — 2026-06-19）

| # | 严重度 | 位置 | 问题 | 状态 |
|---|--------|------|------|------|
| 1 | 🔴 P0 | `Card.jsx:174` | 附件链接硬编码 `http://localhost:3001/uploads/...` | ✅ 改为相对路径 `/uploads/...` |
| 2 | 🔴 P0 | `server/` | API 无认证——公网部署后任何人都能操作数据 | ✅ API Key 认证中间件 |
| 3 | 🟡 P1 | `server/` | 无 CORS 配置——前后端分离部署时跨域被拦截 | ✅ cors 中间件 |
| 4 | 🟡 P1 | `attachmentController.js` | 文件上传无类型限制——可能被传恶意 .html | ✅ fileFilter 白名单 |
| 5 | 🟡 P1 | `.gitignore` | `*.db` 未被忽略——数据库文件在 Git 仓库中 | ✅ 加 *.db + git rm --cached |
| 6 | 🟢 P2 | `attachmentController.js` | 绕过 Model 直接操作 db——打破 MVC 一致性 | ✅ 创建 Attachment Model |
| 7 | 🟢 P2 | `Card.jsx` | 组件过大（210 行）——建议拆分子组件 | 🔵 延后（功能稳定，暂不拆分） |
| 8 | 🟢 P2 | `api.js:70` | `toggleSubtask` 用硬编码 `taskId=0` 绕过路由 | ✅ 改为传参 taskId |

**新增修复（上线审查发现）：**

| # | 严重度 | 位置 | 问题 | 状态 |
|---|--------|------|------|------|
| 9 | 🔴 P0 | 部署架构 | 无生产部署方案——Vite proxy 仅开发有效 | ✅ Express 托管 client/dist + SPA fallback |
| 10 | 🟡 P1 | `server/index.js` | PORT 硬编码 3001 | ✅ process.env.PORT |
| 11 | 🟡 P1 | `server/` | 无请求限流——易被滥用 | ✅ express-rate-limit |
| 12 | 🟡 P1 | `server/` | 无请求日志——出问题难排查 | ✅ morgan |
| 13 | 🟢 P2 | `server/` | 无全局错误处理 | ✅ 四参数错误中间件 |
| 14 | 🟢 P2 | `server/` | 无健康检查端点 | ✅ GET /api/health |
| 15 | 🟢 P2 | `api.js` | `deleteAttachment` 同样硬编码 taskId=0 | ✅ 同 #8 一并修复 |

---

## 9. 开发约定

### 9.1 教学模式下必须遵守

1. **先讲原理，再写代码**：每个改动前解释"是什么、为什么、在架构中什么位置"
2. **逐命令确认**：不要一口气执行多条命令
3. **克制**：改 A 只改 A，不要顺带"优化"B 和 C
4. **每次改动后更新 Note.md**：追加新知识，不覆盖旧内容
5. **复盘确认**：每次改完后确认理解

### 9.2 代码风格

- 后端：CommonJS（`require`），MVC 分层
- 前端：ES Modules（`import`），组件/hooks/services 三层
- 数据库：全部用 `?` 占位符防 SQL 注入
- 命名：清晰描述意图（`handleMoveTask` 不是 `hndl`）

---

## 10. 会话历史摘要

| 日期 | 主要工作 |
|------|---------|
| 2026-05-26 | Day 1-7：项目初始化 → 数据库 → API → 前端 → 联调 → 拖拽 → 样式 |
| 2026-05-29 | Day 1-7 全部完成 + Phase 2 11 项增强功能 |
| 2026-05-31 | CLAUDE.md + Note.md 重构为项目参考文档 |
| 2026-05-31 | **置顶功能修复 Round 1**：移除 `pinned: 0` + `togglePin` 调用（跨列不再取消置顶） |
| 2026-05-31 | 全项目代码注释 + 新建 server/README.md + client/README.md + 更新根 README |
| 2026-05-31 | **置顶功能修复 Round 2**：📌 按钮移出 `.card-actions`（CSS opacity 陷阱） |
| 2026-05-31 | **置顶功能修复 Round 3**：`Board.jsx` 和 `useTasks.js` 排序改为 `pinned DESC → position ASC` |
| 2026-05-31 | Note.md 追加置顶调试实录 + 上线部署注意事项 + 数据库安全快答 |
| 2026-06-19 | **上线准备**：14 项安全修复（P0×5 + P1×5 + P2×4），详见 Note.md 第 13 章 |
| 2026-06-19 | **上线路线决策**：博客优先（Hugo）→ 买境外域名+VPS → 看板挂子域名。经费 ~$82/年 |
| 2026-06-19 | **账号系统决策**：博客公开无需登录。Kanban 独立做 JWT 多用户系统（注册/登录/数据隔离）。博客仅放一个跳转链接。工作计划 2-3 天 |

---

## 11. 如何启动

### 开发模式
```bash
cd 2026-05-26-todo-kanban
npm install && cd server && npm install && cd ../client && npm install && cd ..
node server/db/migrate.js   # 首次运行
npm run dev                  # 前端 :5173 + 后端 :3001
```

### 生产模式
```bash
cp .env.example .env         # 编辑 .env 填入 API_KEY 和 VITE_API_KEY
npm run build                # 构建前端 → client/dist/
npm start                    # 单进程启动，Express 托管一切
```

## 12. 上线路线：博客优先，看板附挂

> 详细记忆文件：`project/blog-kanban-roadmap`（下次会话自动加载）

### 决策
- 买一个域名 + 一台境外 VPS，**不需要备案**
- 博客作为主站（`mydomain.com`），Todo 看板作为子域名工具（`kanban.mydomain.com`）
- 博客技术选型：**Hugo 静态博客**（零资源占用、Markdown 写作、Git 管理）

### 三阶段路线

```
Phase 1: 博客开发（当前）
  → 本地搭建 Hugo，选主题，写初始化文章
  → 预留 Todo Kanban 跳转位
  ↓
Phase 2: 购买 + 部署
  → 买域名（Porkbun .com ≈ $10/年）
  → 买 VPS（Vultr 新加坡 1C1G $6/月）
  → DNS: @ → VPS IP, kanban → VPS IP
  → VPS 装 Nginx + Hugo + Node.js
  → HTTPS: Let's Encrypt 覆盖两个域名
  ↓
Phase 3: 看板上线
  → 部署 Todo Kanban 到同一台 VPS（npm run build && pm2 start）
  → Nginx: kanban.mydomain.com → 127.0.0.1:3001
```

### 目标架构

```
mydomain.com        → Nginx → /opt/blog/public/ (Hugo)
kanban.mydomain.com → Nginx → 127.0.0.1:3001 (Express + SQLite)
```

### 经费
- 域名：$10/年 | VPS：$6/月 | **总计：~$82/年**

---

## 13. 文档索引

| 文档 | 读者 | 内容 |
|------|------|------|
| `README.md` | 所有人 | 项目概述、功能清单、运行说明 |
| `Note.md` | 新手/学习者 | 概念手册：MVC、REST、React、数据库、拖拽原理、调试实录 |
| `server/README.md` | 后端开发者 | API 端点清单 + 数据库表结构 |
| `client/README.md` | 前端开发者 | 组件树 + 数据流 + hooks 说明 |
| `REASONIX.md`（本文件） | AI 助手 | 项目全上下文 |
