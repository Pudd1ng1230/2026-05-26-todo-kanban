# Todo 看板 — 新手概念手册

> 这本手册用通俗语言解释 Todo 看板项目的每一个核心概念。它不按时间顺序记录"哪天做了什么"，而是按**知识体系**组织——你可以把它当作一本迷你教材，顺着读下来就能理解这个项目是怎么建成的。

---

## 1. 快速开始

### 1.1 把项目跑起来

```bash
# 克隆项目
git clone git@github.com:Pudd1ng1230/2026-05-26-todo-kanban.git
cd 2026-05-26-todo-kanban

# 安装依赖（三个 package.json 都要装）
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 初始化数据库（只需首次运行）
node server/db/migrate.js

# 一键启动前后端
npm run dev
```

- 前端打开：**http://localhost:5173**
- 后端 API：**http://localhost:3001/api**

### 1.2 技术栈速览

| 层级 | 用了什么 | 一句话解释 |
|------|----------|------------|
| 前端框架 | React 19 | 把页面拆成一个个"组件"，每个组件管自己那一块 UI |
| 构建工具 | Vite | 开发时极速启动，改代码瞬间刷新浏览器 |
| 拖拽 | @hello-pangea/dnd | 让卡片可以拖来拖去的库 |
| 后端框架 | Express | Node.js 最流行的 Web 框架，几行代码就能写 API |
| 数据库 | SQLite + better-sqlite3 | 数据库就是一个 `.db` 文件，不需要装数据库软件 |
| 文件上传 | multer | 处理前端上传的文件 |

---

## 2. 项目是怎样组织的？

```
todo-kanban/
├── server/                    ← 后端：负责存数据、提供 API
│   ├── db/                    ← 数据库连接 + 建表脚本
│   │   ├── connection.js      ← 打开数据库，全局共享一个连接
│   │   └── migrate.js         ← 建表 + 增量迁移（安全重复运行）
│   ├── models/                ← M 层：跟数据库说话（执行 SQL）
│   ├── controllers/           ← C 层：处理请求逻辑（调 Model，返回响应）
│   ├── routes/                ← R 层：定义 API 地址
│   └── index.js               ← Express 入口，监听 3001 端口
│
├── client/                    ← 前端：负责界面展示
│   └── src/
│       ├── components/        ← React 组件（每个 `.jsx` 文件就是一个组件）
│       │   ├── Board.jsx      ← 三列看板 + 拖拽容器
│       │   ├── Column.jsx     ← 一列（待办 / 进行中 / 已完成）
│       │   ├── Card.jsx       ← 一张任务卡片
│       │   ├── AddCardForm.jsx ← 新建卡片的表单
│       │   ├── BoardSelector.jsx ← 顶部板块切换标签
│       │   ├── SearchBar.jsx  ← 搜索框
│       │   ├── RecycleBin.jsx ← 回收站弹窗
│       │   └── Background.jsx ← Canvas 粒子背景动画
│       ├── hooks/             ← 自定义 hooks（状态管理逻辑）
│       │   ├── useTasks.js    ← 任务数据的增删改查 + 拖拽乐观更新
│       │   ├── useBoards.js   ← 板块切换逻辑
│       │   └── useTimer.js    ← 计时器逻辑
│       └── services/
│           └── api.js         ← 封装所有 fetch 请求
│
├── CLAUDE.md                  ← 给 AI 导师看的项目说明
├── Note.md                    ← 你正在读的这本手册
└── package.json               ← 根目录的脚本（concurrently 一键启动）
```

### 为什么分这么多文件夹？

**单文件项目 = 一个人住的开间**：床、桌子、厨房全在一个房间，乱。

**多文件夹项目 = 一室一厅**：卧室只管睡觉，厨房只管做饭。每个房间功能明确。

2000 行全塞一个文件 vs 拆成多个 100 行小文件：
- 改 Bug 时不用大海捞针
- 前端出问题不用翻后端代码才知道不是后端的问题
- 多人合作时互不覆盖

---

## 3. 前后端是如何通信的？

### 3.1 前后端分离

```
浏览器 (前端 React)              服务器 (后端 Express)
     │                                  │
     │  GET /api/tasks                   │
     │ ──────────────────────────────→  │
     │                                  │  查 SQLite 数据库
     │                                  │
     │  [{"id":1,"title":"买菜"...},...] │
     │ ←────────────────────────────── │
     │                                  │
     │  React 拿到数据，渲染页面          │
```

- **后端只提供数据**（返回 JSON），不关心界面长什么样
- **前端独立应用**，通过 HTTP 请求获取 JSON 后自己渲染页面
- **好处**：职责分离、一套 API 可以被网页 / 手机 App / 小程序共用

### 3.2 为什么前端访问 `/api/tasks` 能到达后端？

Vite 在开发模式下配置了**代理（proxy）**。`client/vite.config.js` 中有这样一行：

```js
proxy: {
  '/api': 'http://localhost:3001',  // 所有 /api 开头的请求 → 转发到后端
}
```

浏览器请求 `http://localhost:5173/api/tasks` → Vite 发现是 `/api` 开头 → 转发给 `http://localhost:3001/api/tasks` → Express 处理并返回 JSON。

**类比**：前端像公司的前台，`/api` 开头的"访客"直接被领到后端办公室，不需要自己绕路。

### 3.3 JSON 是什么？

JSON（JavaScript Object Notation）是一种纯文本数据格式，长得像 JavaScript 对象：

```json
{
  "id": 1,
  "title": "买菜",
  "status": "todo",
  "priority": "high"
}
```

前后端用 JSON 作为"共同语言"交流——前端发 JSON 给后端（创建任务时），后端返回 JSON 给前端（查询时）。任何语言都能读写 JSON，不限于 JavaScript。

---

## 4. 后端是怎样工作的？

### 4.1 MVC 架构

后端代码按 MVC 三层组织——这是 Web 开发最主流的分层方式。

| 层 | 英文 | 职责 | 类比 |
|----|------|------|------|
| M - Model | 数据模型 | 跟数据库打交道（增删改查） | 后厨仓库管理员 |
| V - View | 视图 | 展示数据给用户 | 餐厅的摆盘 |
| C - Controller | 控制器 | 接收请求、调 Model、返回结果 | 服务员 |

> 在本项目中，View 层在 React 前端，后端只有 M 和 C（返回 JSON 而不是 HTML 页面）。所以更准确的说法是 **MC 分层**。

### 4.2 一次请求的完整旅程

以"查看所有任务"为例：

```
浏览器发送 GET /api/tasks
         ↓
① index.js           app.use('/api/tasks', tasksRouter)
                     把 /api/tasks 开头的请求交给 tasks 路由处理
         ↓
② routes/tasks.js    router.get('/', ctrl.getAll)
                     匹配到 GET / → 调用 taskController.getAll
         ↓
③ controllers/       从 req.query 拿参数（board_id, search...）
   taskController.js 调用 Task.getAll(boardId)
                     把返回结果 res.json(tasks) 发给浏览器
         ↓
④ models/Task.js     db.prepare('SELECT * FROM tasks WHERE ...').all(boardId)
                     执行 SQL，返回数据数组
         ↓
⑤ JSON 一路返回给浏览器
```

**每层只做自己份内的事：**

- **Route** 不认识 SQL，只管"哪个 URL 交给谁处理"
- **Controller** 不认识 SQL，只管"拿参数 → 调 Model → 返回 JSON"
- **Model** 不认识 HTTP，只管"执行 SQL 返回数据"

**为什么不能全写在一个函数里？**

项目小的时候还行，但接口多了（20 个、50 个），改数据库表结构就要一个一个接口改。拆成 MVC 后，改数据库只改 Model 层，Controller 和 Route 不用动。

### 4.3 RESTful API 设计

RESTful 的核心原则：**URL 表示"资源"（名词），用 HTTP 方法区分"动作"。**

| HTTP 方法 | 动作 | 示例 |
|-----------|------|------|
| GET | 查询 | `GET /api/tasks` → 获取所有任务 |
| POST | 创建 | `POST /api/tasks` → 新建一个任务 |
| PUT | 更新 | `PUT /api/tasks/3` → 修改 id=3 的任务 |
| DELETE | 删除 | `DELETE /api/tasks/3` → 删除 id=3 的任务 |
| PATCH | 部分更新 | `PATCH /api/tasks/3/move` → 只改状态/位置 |

**好设计 vs 坏设计：**

```
❌ /api/getTasks          （动词塞 URL 里）
❌ /api/createTask        （又是动词）
✅ /api/tasks + GET       （统一地址，方法区分）
✅ /api/tasks + POST      （统一地址，方法区分）
```

### 4.4 参数从哪里来？

Express 提供了三种方式获取请求参数：

| 来源 | Express 写法 | 示例 |
|------|-------------|------|
| URL 路径 | `req.params` | `/api/tasks/3` → `req.params.id = "3"` |
| 请求体 | `req.body` | `POST` 时 `{"title":"买菜"}` → `req.body.title` |
| URL 问号 | `req.query` | `/api/tasks?board_id=2` → `req.query.board_id` |

### 4.5 数据库是怎么操作的？

本项目使用 `better-sqlite3`，它的核心用法：

```js
const db = new Database('todo.db');  // 打开数据库文件

// prepare：编译 SQL 语句（只编译一次，可以反复用）
const stmt = db.prepare('SELECT * FROM tasks WHERE status = ?');

// all：执行查询，返回所有匹配行（数组）
const todoTasks = stmt.all('todo');   // [{id:1, title:'买菜',...}, ...]

// get：执行查询，只返回第一行
const task = stmt.get('done');        // {id:3, title:'学完了',...}

// run：执行写操作（INSERT/UPDATE/DELETE）
const result = db.prepare('INSERT INTO tasks (title) VALUES (?)').run('新任务');
console.log(result.lastInsertRowid);  // 刚插入那条记录的自增 id
```

**关键点：**
- **同步执行** — 不需要 `await`，代码一行一行走，适合新手
- **`?` 占位符** — 防 SQL 注入。用户输入永远被当作文本值，不会变成 SQL 代码
- **`lastInsertRowid`** — INSERT 后立即拿到新记录的 id，可以直接查回完整数据

---

## 5. 数据库里有什么？

### 5.1 表结构总览

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `boards` | 板块 | id, name |
| `tasks` | 任务卡片 | id, title, description, status, priority, due_date, color, board_id, pinned, deleted_at, position |
| `subtasks` | 子任务 | id, task_id, title, completed |
| `timer_sessions` | 计时器记录 | id, task_id, duration |
| `attachments` | 附件 | id, task_id, filename, original_name |

### 5.2 SQLite vs MySQL

| | SQLite | MySQL |
|------|------|------|
| 形态 | 一个 `.db` 文件 | 独立运行的服务器程序 |
| 安装 | `npm install` 即用 | 需单独安装 MySQL Server |
| 配置 | 零配置 | 用户名、密码、权限、字符集… |
| 适合场景 | 本地应用、小项目、学习 | 多用户并发、大型 Web 服务 |

**本项目的选择理由**：学习阶段不需要折腾数据库服务器，SQLite 零配置，够用且够简单。

### 5.3 数据库迁移策略

`server/db/migrate.js` 是本项目的数据库初始化脚本。它的巧妙之处：

```js
// 检查字段是否已存在，不存在才 ALTER TABLE
const taskColumns = db.prepare("PRAGMA table_info('tasks')").all().map(c => c.name);
if (!taskColumns.includes('priority')) {
  db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'");
}
```

这样做的好处：**migrate.js 可以安全地反复运行**，不会因为"字段已存在"而报错。这在开发过程中频繁修改表结构时非常方便。

---

## 6. 前端是怎样工作的？

### 6.1 React 组件树

```
App (管理所有 state)
 ├── Background         ← Canvas 粒子背景动画
 ├── BoardSelector      ← 顶部板块切换标签栏
 ├── SearchBar          ← 搜索框
 ├── Board              ← 看板主体（DragDropContext）
 │   ├── Column[待办]    ← 待办列（Droppable）
 │   │   ├── Card[1]    ← 任务卡片（Draggable）
 │   │   ├── Card[2]
 │   │   └── AddCardForm ← 新建卡片表单
 │   ├── Column[进行中]  ← 进行中列
 │   └── Column[已完成]  ← 已完成列
 └── RecycleBin         ← 回收站弹窗
```

### 6.2 数据是怎么流动的？

React 的核心规则：**数据只从父组件传给子组件（props），子组件通过回调函数通知父组件。**

```
App 持有 tasks state：
  tasks = [{id:1, title:'买菜', status:'todo'}, {id:2, title:'写作业', status:'in-progress'}]

App → Board：  tasks={tasks} onMove={handleMove}
Board → Column：tasks={筛选后的任务} onAdd={addTask}
Column → Card： title="买菜" status="todo" onDelete={removeTask}
```

当用户拖拽一张卡片从"待办"到"进行中"：
1. `Board.jsx` 的 `onDragEnd` 被调用
2. 调用 `useTasks` hook 里的 `handleMoveTask`
3. **先**乐观更新本地 state（界面立刻响应）
4. **再**异步调 API 持久化到数据库

### 6.3 三个关键 React 概念

**useState — 让组件记住数据**

```js
const [tasks, setTasks] = useState([]);
//      ↑        ↑            ↑
//    当前值   修改函数      初始值（空数组）

// 读取：tasks.length
// 修改：setTasks([...tasks, newTask])  ← 注意是替换，不是 .push()
```

**useEffect — 在组件"挂载"后执行代码**

```js
useEffect(() => {
  // 页面加载时自动从后端拉数据
  getTasks(boardId).then(setTasks);
}, [boardId]);  // boardId 变化时重新执行
```

**useRef — 存一个"不会触发重渲染"的值**

```js
const activeRef = useRef(activeId);
activeRef.current = activeId;  // 随时更新，永远是最新值，不会触发重渲染
```

`useRef` 用来解决"回调函数里拿到的是旧 state"的问题——因为回调函数在创建时捕获了当时的 state 值，而 `ref.current` 永远指向最新值。

### 6.4 为什么把 API 调用抽到 services/ 里？

```js
// ❌ 组件里直接写 fetch——组件变得臃肿
function App() {
  const loadTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };
}

// ✅ API 调用集中在 services/api.js
// 组件只关心数据，不关心"怎么请求"
import { getTasks } from '../services/api';
function App() {
  const loadTasks = () => getTasks(boardId).then(setTasks);
}
```

**好处**：如果后端 API 地址变了，只改 `api.js` 一个文件。如果有 10 个组件都直接写 fetch，要改 10 个地方。

---

## 7. 拖拽是怎么实现的？

### 7.1 三个核心概念

`@hello-pangea/dnd` 用三个组件构建拖拽系统：

| 组件 | 作用 | 在本项目中的位置 |
|------|------|-----------------|
| `DragDropContext` | 拖拽的"总控"，监听拖拽开始/结束 | `Board.jsx` |
| `Droppable` | 可以"放东西进去"的区域 | `Column.jsx`（每列一个） |
| `Draggable` | 可以"被拖"的东西 | `Card.jsx`（每张卡片一个）|

```
DragDropContext (整个看板)
  └── Droppable droppableId="todo" (待办列)
  │     ├── Draggable draggableId="1" (卡片1)
  │     └── Draggable draggableId="2" (卡片2)
  └── Droppable droppableId="in-progress" (进行中列)
        └── Draggable draggableId="3" (卡片3)
```

### 7.2 拖拽结束后发生了什么？

```js
const handleDragEnd = (result) => {
  const { source, destination, draggableId } = result;
  // source.droppableId = "todo"        ← 原来在哪列
  // destination.droppableId = "done"   ← 放到了哪列
  // destination.index = 1              ← 在目标列的第几个位置

  // 1. 乐观更新：立刻改本地 state，界面秒响应
  setTasks(prev => { /* 重新排序 */ });

  // 2. 持久化：调 API 把新状态写入数据库
  moveTask(taskId, newStatus, newPosition);
};
```

**乐观更新 vs 保守更新：**

| 策略 | 做法 | 体验 |
|------|------|------|
| 保守更新 | 先调 API，等服务器返回成功再改 UI | 拖完要等一下才看到效果（卡） |
| 乐观更新 | 先改 UI，同时异步调 API | 拖完立刻看到效果（丝滑） |

本项目用乐观更新——拖拽体验非常流畅。

---

## 8. 增强功能速览

| 功能 | 实现方式 | 关键文件 |
|------|---------|---------|
| **多板块切换** | boards 表 + BoardSelector 组件 | `useBoards.js`, `BoardSelector.jsx` |
| **截止日期** | tasks.due_date 字段，前端比较 `new Date()` | `Card.jsx`（逾期红色 + ⚠ 图标） |
| **优先级** | tasks.priority 字段（high/medium/low） | 左侧色条 + 角标，`AddCardForm.jsx` |
| **子任务** | subtasks 表，关联 task_id | `Card.jsx` 内嵌 checkbox + 进度条 |
| **附件上传** | multer 处理上传，attachments 表记录 | `attachmentController.js`, `Card.jsx` |
| **计时器** | 前端 setInterval 计时，暂停时存入 timer_sessions 表 | `useTimer.js`, `Card.jsx` |
| **搜索** | SQL LIKE 模糊匹配 title 和 description | `SearchBar.jsx` → `api.js` → `Task.search()` |
| **卡片颜色** | tasks.color 字段，7 色可选 | `AddCardForm.jsx` 颜色选择器 |
| **暗色主题** | CSS 变量系统（`:root` 定义全套颜色） | `index.css` |
| **响应式布局** | `@media (max-width: 768px)` 三列变纵向 | `index.css` |
| **回收站** | tasks.deleted_at 软删除，回收站弹窗恢复/彻底删除 | `RecycleBin.jsx`, `Task.remove/restore/permanentDelete` |
| **置顶** | tasks.pinned 字段，ORDER BY pinned DESC | `Card.jsx` 📌 按钮 |

---

## 9. 常见问题与坑

### 9.1 端口被占用

```
Error: Port 5173 is already in use
```

**原因**：上次的 Vite 进程没关。**解决**：关掉旧终端窗口，或在任务管理器里结束 Node.js 进程。

### 9.2 `npm install` 后缺包

如果报 `Cannot find module 'xxx'`，检查是否在正确的目录执行了 `npm install`。三个 package.json 各自独立：
- 根目录装 `concurrently`
- `server/` 装 `express`、`better-sqlite3`、`multer`
- `client/` 装 `react`、`vite`、`@hello-pangea/dnd`

### 9.3 数据库报错

如果前端报"加载失败"或接口 500：
1. 确认跑了 `node server/db/migrate.js`
2. 确认 `server/db/todo.db` 文件存在
3. 如果字段缺失，重跑 `migrate.js`（它设计为可重复安全运行）

### 9.4 `dependencies` vs `devDependencies`

`package.json` 里有两个依赖列表：

| 字段 | 用途 | 举例 |
|------|------|------|
| `dependencies` | 运行时必须的包 | express, react, better-sqlite3 |
| `devDependencies` | 只在开发时用的包 | nodemon, vite, eslint |

安装时用 `npm install 包名`（写入 dependencies），或 `npm install -D 包名`（写入 devDependencies）。

### 9.5 `package-lock.json` 是什么？

`package.json` 说"我要 5.x.x 版本"，`package-lock.json` 说"就要 5.2.1，一点不能差"。

作用是保证你、同学、服务器安装的依赖版本**完全一致**，避免"我电脑上能跑，你电脑上报错"的玄学问题。**不要删它，要提交到 Git。**

### 9.6 `import` vs `require`

| 写法 | 名称 | 用在哪 |
|------|------|--------|
| `require('express')` | CommonJS | Node.js 传统写法，后端用 |
| `import ... from '...'` | ES Modules | 现代标准，前端 React/Vite 用 |

后端用 require 是因为 Express 生态以 CommonJS 为主，前端用 import 是因为浏览器原生支持 ES Modules。

### 9.7 `__dirname` 是什么？

`__dirname` 是 Node.js 内置变量，始终等于**当前脚本所在目录的绝对路径**。

```js
const db = new Database(path.join(__dirname, 'todo.db'));
// path.join 拼接：/Users/xxx/server/db/ + todo.db = /Users/xxx/server/db/todo.db
```

这样不管你在哪个目录执行 `node` 命令，`todo.db` 永远创建在正确的位置。

---

## 附录：语言选择 — 为什么用 Node.js 而不是 C++？

不同语言有不同的擅长领域：

| 语言 | 强项 | 典型场景 |
|------|------|----------|
| C++ | 极致性能、硬件控制 | 游戏引擎、操作系统、高频交易 |
| Node.js | 开发快、生态大、前后端同语言 | Web 应用、API 服务 |
| Python | 语法简单、AI 库丰富 | 机器学习、数据分析 |
| Go | 并发强、部署简单 | 云服务、微服务 |

Todo 看板的业务逻辑极其简单（增删改查），用 C++ 写需要几百行处理内存和字符串，Node.js 只要 5 行。而且前端是 JavaScript，后端也用 JS，不用同时学两种语言。

**类比**：C++ 是重型卡车，Node.js 是买菜车。去超市不需要开卡车。
