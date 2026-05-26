# Todo 看板 (Kanban Board)

一个可以在线使用的拖拽式待办事项看板，类似 Trello 的简化版。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Vite |
| 后端 | Node.js + Express |
| 数据库 | SQLite |
| 拖拽 | @hello-pangea/dnd |

## 核心功能

- **任务卡片管理**：创建、编辑、删除任务卡片
- **三列看板**：待办 → 进行中 → 已完成
- **拖拽移动**：拖拽卡片在不同列之间自由移动
- **数据持久化**：所有数据保存在 SQLite 数据库中，刷新不丢失

## 最终效果

一个简洁直观的任务管理看板——打开网页就能看到三列布局，点击按钮新建任务卡片，拖拽卡片改变状态，所有操作自动保存。

## 本地运行

```bash
git clone git@github.com:Pudd1ng1230/2026-05-26-todo-kanban.git
cd 2026-05-26-todo-kanban
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
npm run dev
```

浏览器打开 http://localhost:5173 即可使用。

## 项目状态

正在开发中，按 7 天计划逐步推进。
