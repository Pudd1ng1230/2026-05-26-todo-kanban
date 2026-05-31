# Todo 看板 (Kanban Board)

一个可以在线使用的拖拽式待办事项看板，类似 Trello 的简化版。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite 8 |
| 后端 | Express 5 + better-sqlite3 |
| 数据库 | SQLite（WAL 模式） |
| 拖拽 | @hello-pangea/dnd 18 |
| 文件上传 | multer |
| 样式 | 暗色主题，CSS 变量系统，响应式布局 |

## 功能清单

### 基础功能
- ✅ 三列看板：待办 → 进行中 → 已完成
- ✅ 创建 / 编辑 / 删除任务卡片
- ✅ 拖拽卡片在列间移动，同列排序（乐观更新）
- ✅ 数据持久化（SQLite，刷新不丢失）

### 增强功能
- ✅ **多板块切换** — 顶部标签栏，每个板块独立三列看板
- ✅ **截止日期** — 卡片逾期红色 ⚠ 提醒
- ✅ **优先级** — 高 / 中 / 低，左侧色条 + 角标
- ✅ **子任务** — 卡片内嵌 checkbox + 进度条
- ✅ **附件上传** — 图片 / 文件上传（multer，10MB 限制）
- ✅ **计时器** — 每张卡片独立计时，暂停时自动存入后端
- ✅ **搜索框** — 关键字实时过滤
- ✅ **卡片颜色** — 7 色可选，手动自定义
- ✅ **暗色主题** — 默认暗色，CSS 变量系统
- ✅ **移动端适配** — 768px 响应式断点，三列变纵向
- ✅ **回收站** — 软删除 + 恢复 + 彻底删除
- ✅ **卡片置顶** — 拖拽不取消置顶，仅手动切换

## 项目结构

```
todo-kanban/
├── server/                    # 后端 — Express + SQLite
│   ├── db/                    # 数据库连接 + 迁移脚本
│   ├── models/                # M 层：数据操作（SQL）
│   ├── controllers/           # C 层：业务逻辑
│   ├── routes/                # R 层：API 端点
│   ├── uploads/               # 上传文件存储
│   ├── index.js               # Express 入口（端口 3001）
│   └── README.md              # 后端 API 文档
│
├── client/                    # 前端 — React + Vite
│   ├── public/                # 静态资源
│   └── src/
│       ├── components/        # React 组件
│       ├── hooks/             # 自定义 hooks
│       ├── services/          # API 请求封装
│       ├── App.jsx            # 根组件
│       ├── main.jsx           # React 入口
│       └── index.css          # 全局样式
│
├── CLAUDE.md                  # AI 导师上下文
├── Note.md                    # 新手概念手册
├── README.md                  # 本文件
└── package.json               # concurrently 一键启动
```

## 本地运行

```bash
# 1. 克隆项目
git clone git@github.com:Pudd1ng1230/2026-05-26-todo-kanban.git
cd 2026-05-26-todo-kanban

# 2. 安装依赖（三个 package.json）
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. 初始化数据库（首次运行）
node server/db/migrate.js

# 4. 一键启动前后端
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001/api

## 数据流

```
浏览器 (React)                 服务器 (Express)
     │                              │
     │  GET /api/tasks               │
     │ ──────────────────────────→  │
     │                              │  查询 SQLite
     │  ← [{id:1, title:"买菜"...}] │
     │                              │
     │  React 渲染三列看板            │
```

## 文档索引

| 文档 | 面向读者 | 内容 |
|------|---------|------|
| [Note.md](./Note.md) | 新手 / 学习者 | 概念手册：MVC、REST、React、数据库、拖拽原理 |
| [server/README.md](./server/README.md) | 后端开发者 | API 端点清单 + 数据库表结构 |
| [client/README.md](./client/README.md) | 前端开发者 | 组件树 + 数据流 + hooks 说明 |
| [CLAUDE.md](./CLAUDE.md) | AI 导师 | 项目上下文 + 教学模式规则 |
