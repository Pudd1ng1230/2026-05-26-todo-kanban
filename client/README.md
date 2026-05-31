# Client — 前端文档

## 技术栈

- **框架**：React 19
- **构建工具**：Vite 8
- **拖拽库**：@hello-pangea/dnd 18
- **样式**：纯 CSS（CSS 变量 + 暗色主题 + 响应式）

## 目录结构

```
client/
├── public/
│   ├── background.jpg          # 背景图片
│   └── favicon.svg             # 网站图标
└── src/
    ├── components/             # React 组件（纯 UI）
    │   ├── App.jsx             # 根组件 — 状态管理 + 布局组合
    │   ├── Board.jsx           # 看板主体 — DragDropContext + 三列
    │   ├── Column.jsx          # 单列容器 — Droppable 区域
    │   ├── Card.jsx            # 任务卡片 — Draggable + 5 种交互模式
    │   ├── AddCardForm.jsx     # 新建卡片表单 — 渐进式展开
    │   ├── BoardSelector.jsx   # 板块切换标签栏
    │   ├── SearchBar.jsx       # 搜索框 — 实时过滤
    │   ├── RecycleBin.jsx      # 回收站弹窗 — 恢复/彻底删除
    │   └── Background.jsx      # Canvas 粒子背景动画
    ├── hooks/                  # 自定义 hooks（状态逻辑）
    │   ├── useTasks.js         # 任务 CRUD + 拖拽乐观更新 + 回收站
    │   ├── useBoards.js        # 板块状态管理
    │   └── useTimer.js         # 计时器逻辑
    ├── services/
    │   └── api.js              # API 请求封装（所有 fetch 调用）
    ├── index.css               # 全局样式（~500 行 CSS 变量系统）
    └── main.jsx                # React 入口 — createRoot
```

## 组件树

```
App
 ├── Background         Canvas 粒子动画（固定背景层）
 ├── BoardSelector      板块标签栏
 ├── SearchBar          搜索框
 ├── Board              DragDropContext（拖拽容器）
 │   ├── Column[todo]   Droppable
 │   │   ├── Card[1]    Draggable（编辑/子任务/附件/计时器）
 │   │   ├── Card[2]
 │   │   └── AddCardForm
 │   ├── Column[in-progress]
 │   └── Column[done]
 └── RecycleBin         模态浮层（条件渲染）
```

## 数据流

### 单向数据流

```
useBoards()  →  boards, activeId
useTasks(activeId)  →  tasks, loading, error
    ↓
App 持有全部 state，通过 props 向下传递：
    App → Board (tasks, onAdd, onDelete, onMove, onEdit, onPin)
         → Column (status, filtered tasks)
              → Card (title, status, priority...)
              → AddCardForm (onAdd)

子组件通过回调函数向 App 报告用户操作：
    Card.onPin(id) → App → useTasks.handleTogglePin(id) → API → setTasks
```

### 拖拽数据流

```
用户拖拽卡片
  → Board.onDragEnd(result)
    → useTasks.handleMoveTask(taskId, newStatus, newPosition)
      ├── 1. setTasks()    乐观更新本地 state（UI 秒响应）
      └── 2. moveTask()    异步调 API 持久化到后端
```

## Hooks 说明

### useBoards

管理板块列表和当前激活板块。关键设计：用 `useRef` 存 `activeId` 的最新值，避免 `removeBoard` 回调中的闭包过期问题（曾导致白屏 bug）。

```js
const { boards, activeId, setActiveId, addBoard, removeBoard } = useBoards();
```

### useTasks(boardId)

任务的核心状态管理器。当 `boardId` 变化时自动重新加载。

```js
const {
  tasks,              // 当前任务数组
  loading,            // 加载状态
  error,              // 错误信息
  addTask,            // (status, title, desc, priority, dueDate, color) → void
  removeTask,         // (id) → void（软删除）
  editTask,           // (id, title, desc, priority, dueDate, color) → void
  handleMoveTask,     // (taskId, newStatus, newPosition) → void（乐观更新）
  handleTogglePin,    // (taskId) → void
  search,             // (keyword) → void（空字符串 = 重置）
  reload,             // () → void（强制刷新）
} = useTasks(activeId);
```

### useRecycleBin(boardId)

回收站专用 Hook，数据源为 `GET /api/tasks?deleted=true`。

```js
const { tasks, loading, restore, permanentDelete, reload } = useRecycleBin(activeId);
```

### useTimer(taskId)

计时器逻辑。使用 `Date.now()` 计算真实耗时避免定时器漂移，暂停时自动 `POST /api/tasks/:taskId/timer` 保存 duration。

```js
const { elapsed, savedTotal, running, display, start, pause, reset, toggle } = useTimer(taskId);
// display: "MM:SS" 格式
// savedTotal: 后端累计秒数
```

## API 通信

所有请求通过 `services/api.js` 统一管理，基础路径 `/api` 经 Vite proxy 转发到 `http://localhost:3001`。

Vite 代理配置（`vite.config.js`）：
```js
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3001',
  },
}
```

## 样式系统

使用 CSS 变量定义全套配色（`:root` 块），每个状态列有独立强调色：

| 列 | 主色 | CSS 变量 |
|------|------|----------|
| 待办 | `#e87850` 橙 | `--orange` |
| 进行中 | `#4db8c8` 青 | `--cyan` |
| 已完成 | `#3a9e96` 青绿 | `--teal` |

按钮、输入框、hover 效果、drag-over 高亮均跟随列配色。响应式断点 768px，三列变纵向堆叠。

## 启动命令

```bash
npm run dev      # Vite 开发服务器（热更新）
npm run build    # 生产构建
npm run preview  # 预览生产构建
```
