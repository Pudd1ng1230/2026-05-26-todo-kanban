# Server — 后端文档

## 技术栈

- **框架**：Express 5
- **数据库**：SQLite + better-sqlite3（同步驱动）
- **文件上传**：multer
- **端口**：3001

## 目录结构

```
server/
├── index.js                    # Express 入口
├── db/
│   ├── connection.js           # 数据库单例连接
│   └── migrate.js              # 建表 + 增量迁移（可重复安全运行）
├── models/                     # M 层 — 数据操作
│   ├── Task.js                 # 核心：任务 CRUD + 搜索 + 软删除 + 置顶
│   ├── Board.js                # 板块 CRUD
│   ├── Subtask.js              # 子任务 CRUD + toggle
│   └── Timer.js                # 计时器累计
├── controllers/                # C 层 — 业务逻辑
│   ├── taskController.js       # 任务接口：参数验证 + 调 Model + 返回 JSON
│   ├── boardController.js      # 板块接口
│   ├── subtaskController.js    # 子任务接口
│   ├── timerController.js      # 计时器接口
│   └── attachmentController.js # 附件上传/查询/删除
├── routes/                     # R 层 — API 端点
│   ├── tasks.js       → /api/tasks
│   ├── boards.js      → /api/boards
│   ├── subtasks.js    → /api/tasks/:taskId/subtasks
│   ├── timer.js       → /api/tasks/:taskId/timer
│   └── attachments.js → /api/tasks/:taskId/attachments
└── uploads/                    # 上传文件存储目录
```

## API 端点清单

### Tasks — 任务

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 获取任务列表。查询参数：`board_id`（板块筛选）、`search`（关键字搜索）、`deleted=true`（回收站） |
| GET | `/api/tasks/:id` | 获取单个任务 |
| POST | `/api/tasks` | 创建任务。body: `{ title, description?, board_id?, priority?, due_date?, color? }` |
| PUT | `/api/tasks/:id` | 更新任务。body: `{ title, description?, priority?, due_date?, color? }` |
| DELETE | `/api/tasks/:id` | 软删除（移入回收站） |
| PATCH | `/api/tasks/:id/move` | 拖拽移动。body: `{ status, position }` |
| PATCH | `/api/tasks/:id/restore` | 从回收站恢复 |
| PATCH | `/api/tasks/:id/pin` | 切换置顶状态 |
| DELETE | `/api/tasks/:id/permanent` | 彻底删除（不可恢复） |

### Boards — 板块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/boards` | 所有板块 |
| POST | `/api/boards` | 创建板块。body: `{ name }` |
| PUT | `/api/boards/:id` | 更新板块名称 |
| DELETE | `/api/boards/:id` | 删除板块（关联任务级联删除） |

### Subtasks — 子任务

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks/:taskId/subtasks` | 获取某任务的所有子任务 |
| POST | `/api/tasks/:taskId/subtasks` | 创建子任务。body: `{ title }` |
| PUT | `/api/tasks/:taskId/subtasks/:id` | 修改子任务标题 |
| PATCH | `/api/tasks/:taskId/subtasks/:id/toggle` | 切换完成状态 |
| DELETE | `/api/tasks/:taskId/subtasks/:id` | 删除子任务 |

### Attachments — 附件

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks/:taskId/attachments` | 获取某任务的所有附件 |
| POST | `/api/tasks/:taskId/attachments` | 上传文件（multipart/form-data，字段名 `file`，最大 10MB） |
| DELETE | `/api/tasks/:taskId/attachments/:id` | 删除附件（同时删除磁盘文件） |

### Timer — 计时器

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks/:taskId/timer` | 获取累计计时（秒）。返回: `{ total: number }` |
| POST | `/api/tasks/:taskId/timer` | 保存本次计时。body: `{ duration: number }`（秒） |

## 数据库表结构

### boards

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| name | TEXT NOT NULL | 板块名称 |
| created_at | TEXT | 创建时间 |

### tasks

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| title | TEXT NOT NULL | 任务标题 |
| description | TEXT | 任务描述 |
| status | TEXT | todo / in-progress / done |
| position | INTEGER | 在当前状态列中的排序位置 |
| priority | TEXT | high / medium / low |
| due_date | TEXT | 截止日期（YYYY-MM-DD） |
| color | TEXT | 卡片颜色 hex |
| board_id | INTEGER | 所属板块 ID |
| pinned | INTEGER | 置顶标志（0/1） |
| deleted_at | TEXT | 软删除时间戳（NULL = 未删除） |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### subtasks

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| task_id | INTEGER FK | 关联任务 ID（CASCADE 删除） |
| title | TEXT NOT NULL | 子任务标题 |
| completed | INTEGER | 完成标志（0/1） |
| position | INTEGER | 排序位置 |

### timer_sessions

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| task_id | INTEGER FK | 关联任务 ID（CASCADE 删除） |
| start_time | TEXT | 开始时间 |
| end_time | TEXT | 结束时间 |
| duration | INTEGER | 本次计时秒数 |

### attachments

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| task_id | INTEGER FK | 关联任务 ID（CASCADE 删除） |
| filename | TEXT | 存储文件名（时间戳+随机数） |
| original_name | TEXT | 原始文件名 |
| size | INTEGER | 文件大小（字节） |
| created_at | TEXT | 上传时间 |

## 启动命令

```bash
# 初始化数据库（首次运行或字段变更后）
node server/db/migrate.js

# 开发模式（nodemon 热重载）
npm run dev

# 生产模式
npm start
```
