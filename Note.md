
---

## Day 1：项目初始化与环境搭建

**日期**：2026-05-26

### 一、本阶段目标回顾

搭建了 Todo 看板项目的前后端骨架，最终实现：
- 后端 Express 服务器在 3001 端口运行，有一个 `/api/hello` 测试接口
- 前端 React + Vite 在 5173 端口运行，显示"Todo 看板"标题
- 根目录通过 concurrently 实现一条 `npm run dev` 同时启动前后端

### 二、核心概念解析

**1. package.json —— 项目的"身份证"**
- 记录了三类信息：项目元信息（名称、版本）、依赖清单（dependencies / devDependencies）、脚本快捷方式（scripts）
- `npm install` 按此文件下载所有依赖到 `node_modules/`
- `dependencies` 是运行时必须的包（如 express）；`devDependencies` 只在开发时用（如 nodemon）
- 每个子项目（根、server、client）各有自己的 package.json，互不干扰

**2. npm —— Node 的包管理器**
- 三个核心功能：安装别人的包（`npm install`）、运行脚本（`npm run`）、发布自己的包（`npm publish`）
- 类似手机应用商店，是全球最大的开源代码仓库（200万+包）

**3. 前后端分离**
- 后端只提供 API（返回 JSON 数据），不关心界面
- 前端独立应用，通过 HTTP 请求获取 JSON 后自己渲染页面
- 好处：职缺分离、一套 API 多端复用、独立部署互不干扰

**4. Vite vs 传统打包器（Webpack）**
- 传统做法：启动时把所有源码全部打包完再给浏览器 → 慢
- Vite：利用浏览器原生 ESM（import/export），开发时不打包，浏览器要什么就实时编译什么 → 极快
- 热更新（HMR）：改一行代码，Webpack 要重新打包整个模块，Vite 只重编译改动的那一个文件

**5. 其他概念**
- **JSON**：一种纯文本数据格式，跨语言通用，用于存储和传输结构化信息
- **npm init -y**：在当前目录创建 package.json，-y 表示全部用默认值
- **proxy（代理）**：Vite 开发时把 `/api` 请求转发到后端 3001 端口，解决跨域问题
- **concurrently**：一条命令同时启动多个进程，用颜色区分输出

### 三、遇到的坑与解决方案

| 坑 | 原因 | 解决 |
|----|------|------|
| Vite 报"Port 5173 is in use" | 上次的 Vite 进程没关，占了端口 | 关掉旧进程，或让 Vite 自动切换到其他端口（如 5174） |
| `npm install` 后忘了装 `npm install -D` 的区别 | 没理解 dependencies vs devDependencies | `-D` 或 `--save-dev` 写入 devDependencies |
| 三个 package.json 让人困惑 | 不习惯多 package.json 的项目结构 | 每个 package.json 只管自己目录的事，通过根 package.json 的 concurrently 统一调度 |

### 四、代码片段示例

**server/index.js —— Express 最小启动**
```js
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());  // 解析 JSON 请求体

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

**client/vite.config.js —— 配置代理**
```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',  // /api 请求 → 后端
    },
  },
});
```

**根 package.json —— concurrently 一键启动**
```json
{
  "scripts": {
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "dev": "concurrently -n server,client -c blue,green \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

### 五、启动命令

```bash
cd todo-kanban
npm run dev    # 同时启动前后端
```

- 后端访问：http://localhost:3001/api/hello
- 前端访问：http://localhost:5173

### 六、补充知识（课后讨论）

**1. 为什么用 Node.js 而不是 C++ 写后端？**

不同语言有不同战场：

| 语言 | 强项 | 典型场景 |
|------|------|----------|
| C++ | 极致性能、硬件控制 | 游戏引擎、操作系统、高频交易 |
| Node.js | 开发快、生态大、前后端同语言 | Web 应用、API 服务 |
| Python | 语法简单、AI 库丰富 | 机器学习、数据分析 |
| Go | 并发强、部署简单 | 云服务、微服务 |

Todo 看板的业务逻辑极其简单（增删改查），用 C++ 写需要几百行处理内存和字符串，Node.js 只要 5 行。而且前端是 JavaScript，后端也用 JS，不用同时学两种语言。

**类比**：C++ 是重型卡车，Node.js 是买菜车。去超市不需要开卡车。

**2. 为什么要这么多文件夹？难道不能全塞在一起？**

单文件项目 = 一个人住的开间，床、桌、厨房全在一个房间。

多文件夹项目 = 一室一厅，卧室只管睡觉、厨房只管做饭。每个房间功能明确。

2000 行全塞一个文件 vs 拆成多个 100 行小文件：
- 改接口不用在 2000 行里大海捞针
- 前端出 bug 不用翻后端代码才知道不是后端的问题
- 多人合作时互不覆盖

目前大多数文件夹是空的，只有 3 个文件有实质内容。到第 5 天回头看，每个文件夹的作用都会很自然。

**3. package-lock.json 是什么？**

`package.json` 说 "我要 5.x.x 版本"，`package-lock.json` 说 "就要 5.2.1，一点不能差"。

作用是保证你、同学、服务器安装的依赖版本**完全一致**，避免"我电脑上能跑"变成玄学问题。

**4. import 和 require 的区别**

`require('express')` 是 Node.js 传统写法（CommonJS），`import ... from ...` 是新写法（ES Modules）。后端用 require 因为 Express 生态更稳定，前端 React/Vite 用 import 因为浏览器原生支持。

**5. MVC 架构是什么？**

MVC 是一种把后端代码拆成三层的设计模式，源自桌面 GUI 时代，至今是 Web 开发的主流分层方式。

| 层 | 英文 | 职责 | 类比 |
|----|------|------|------|
| M - Model | 数据模型 | 跟数据库打交道（增删改查） | 后厨仓库管理员 |
| V - View | 视图 | 展示数据给用户 | 餐厅的摆盘 |
| C - Controller | 控制器 | 接收请求、调 Model、返回结果 | 服务员 |

**一次完整的请求流程**：

```
浏览器请求 "给我所有任务"
    ↓
Route（路由） →  匹配 URL，转发给正确的 Controller
    ↓
Controller（控制器） →  调用 Model 查数据，把结果返回
    ↓
Model（模型） →  执行 SQL 语句，返回数据
    ↓
Controller 把数据变成 JSON 返回给浏览器
```

**为什么要分层？**

如果全写在一个函数里：

```js
// 反例：路由 + 逻辑 + 数据库操作 混在一起
app.get('/api/tasks', (req, res) => {
  const db = new Database('todo.db');
  const rows = db.prepare('SELECT * FROM tasks WHERE status = ?').all('todo');
  // 在这里混了 路由匹配 + 业务逻辑 + 数据库操作
  res.json(rows);
});
```

项目小的时候还行，但一旦接口多了（10 个、20 个），改数据库表结构就要改每个接口函数。拆成 MVC 后，改数据库只需要改 Model 层，Controller 和 Route 不用动。

**在本项目中的对应关系**：

```
server/
├── routes/        → "有哪些 API 地址"（/api/tasks, /api/tasks/:id）
├── controllers/   → "每个地址干什么"（查、增、删、改的具体逻辑）
├── models/        → "怎么跟数据库说话"（SQL 语句在这里）
└── db/            → "数据库连接"（打开/关闭 SQLite 文件）
```

**类比**：不建 MVC 就像把所有文件堆桌面上，MVC 就像按工作/学习/娱乐建三个文件夹。东西多了不乱。

> Day 3 我们会亲手实现这个分层，到时候每个文件夹写代码进去就更清楚了。

---

## Day 2：数据库设计与建表

**日期**：2026-05-29

### 一、本阶段目标回顾

设计并创建 SQLite 数据库，插入测试数据验证表结构可用。

- 安装 `better-sqlite3` 驱动
- 写 `init.js` 建表脚本（7 个字段）
- 写 `seed.js` 插入 4 条测试数据
- 验证数据查询正常

### 二、核心概念解析

**1. SQLite vs MySQL**

| | SQLite | MySQL |
|------|------|------|
| 形态 | 一个 `.db` 文件 | 独立运行的服务器程序 |
| 安装 | npm install 即用 | 需单独安装 MySQL Server |
| 配置 | 零配置 | 用户名、密码、权限、字符集... |
| 适合场景 | 本地应用、小项目、嵌入式 | 多用户并发、大型 Web 服务 |

SQLite 的数据库引擎**嵌入在 `better-sqlite3` 包里**（用 C 语言写的），调用时直接在你 Node.js 进程内执行，不经过网络。MySQL 则需要通过网络端口（3306）与独立进程通信。

**2. better-sqlite3 —— 同步驱动**

```js
const db = new Database('todo.db');

// prepare：编译 SQL → 返回一个可复用的"语句对象"
const stmt = db.prepare('SELECT * FROM tasks WHERE status = ?');

// all：执行查询，返回所有匹配行（数组）
const todoTasks = stmt.all('todo');

// run：执行写操作，返回 { changes: 1, lastInsertRowid: 5 }
const result = stmt.run('学习 SQL', '', 'todo');
```

关键点：
- **同步执行** — 不需要 `await`，代码一行一行走，适合新手
- **prepare/run 模式** — 先编译 SQL（prepare），再传参数执行（run/all/get），比直接拼接字符串安全
- **`?` 占位符** — 防 SQL 注入。驱动会自动处理转义，用户输入永远不会被当成 SQL 代码执行

**3. 为什么分 init.js 和 seed.js？**

- `init.js`：管**表结构**（schema）——什么时候建什么表、有哪些字段。只改结构的时候用
- `seed.js`：管**测试数据** —— 开发时随手插几条假数据验证功能。功能稳定后可以删

分开的好处：重置测试数据时不需要重新建表，只需要 `node seed.js` 再跑一次。

### 三、遇到的坑与解决方案

| 坑 | 原因 | 解决 |
|----|------|------|
| `node -e` 找不到 better-sqlite3 | -e 在当前目录运行，不在 server/ 下 | 改用 NODE_PATH 指定 server/node_modules，或直接在 server/db/ 里写独立脚本 |
| init.js 重复运行报错 | CREATE TABLE 不带 IF NOT EXISTS | 加上 `IF NOT EXISTS` 后可以安全重复运行 |

### 四、代码片段示例

**server/db/init.js —— 建表脚本**
```js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'todo.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'todo',
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  )
`);

console.log('数据库初始化完成：tasks 表已创建');
db.close();
```

**server/db/seed.js —— 测试数据**
```js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'todo.db'));

const insert = db.prepare('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)');

insert.run('学习 SQLite 基础', '了解 SQLite 和 MySQL 的区别', 'done');
insert.run('搭建后端 API', '实现增删改查接口', 'in-progress');
insert.run('写前端页面', '', 'todo');
insert.run('拖拽功能', '用 @hello-pangea/dnd 实现卡片拖拽', 'todo');

console.log('测试数据插入完成');
db.close();
```

**tasks 表结构总览**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| title | TEXT NOT NULL | 任务标题，必填 |
| description | TEXT DEFAULT '' | 任务描述，默认为空 |
| status | TEXT DEFAULT 'todo' | todo / in-progress / done |
| position | INTEGER DEFAULT 0 | 排序位置 |
| created_at | TEXT | 创建时间，自动填充本地时间 |
| updated_at | TEXT | 更新时间，自动填充本地时间 |

### 五、数据库快速操作

```bash
# 初始化数据库（建表）
node server/db/init.js

# 插入测试数据
node server/db/seed.js

# 查看数据（命令行）
node -e "
const Database = require('better-sqlite3');
const db = new Database('server/db/todo.db');
console.log(JSON.stringify(db.prepare('SELECT * FROM tasks').all(), null, 2));
db.close();
"
```

### 六、补充知识

**1. `__dirname` 是什么？**

`__dirname` 是 Node.js 内置变量，始终等于**当前脚本所在的目录的绝对路径**。`path.join(__dirname, 'todo.db')` 保证 `todo.db` 始终创建在 `server/db/` 下，不会因为你在哪个目录执行 `node` 命令而乱跑。

**2. prepare + ? 占位符为什么安全？**

对比：
```js
// 危险：用户输入 "; DROP TABLE tasks; --"会删表
db.exec(`INSERT INTO tasks (title) VALUES ('${userInput}')`);

// 安全：用户输入永远当作"字符串值"，不会变成 SQL 代码
db.prepare('INSERT INTO tasks (title) VALUES (?)').run(userInput);
```

`?` 占位符把"SQL 代码"和"数据值"彻底分开，数据库引擎不会把用户输入当成命令执行。

---

## Day 3：后端 API 设计与实现（CRUD）

**日期**：2026-05-29

### 一、本阶段目标回顾

实现完整的 RESTful API，通过 HTTP 请求操作数据库。最终 5 个接口全部通过 curl 验证。

- `GET /api/tasks` — 获取所有任务
- `POST /api/tasks` — 创建新任务
- `PUT /api/tasks/:id` — 更新任务
- `DELETE /api/tasks/:id` — 删除任务
- `PATCH /api/tasks/:id/move` — 移动（改状态/位置）

### 二、核心概念解析

**1. RESTful API 设计原则**

- **URL 只表示"资源"（名词）**，不表示"动作"（动词）
- **用 HTTP 方法区分动作**：GET = 查，POST = 增，PUT = 改，DELETE = 删
- 反例：`/api/getTasks`、`/api/createTask`（把动词塞 URL 里）
- 正例：都用 `/api/tasks`，靠方法区分

**2. MVC 在代码中的体现**

```
请求 GET /api/tasks
  ↓
index.js          → app.use('/api/tasks', tasksRouter)  挂载路由
  ↓
routes/tasks.js   → router.get('/', controller.getAll)   URL → Controller
  ↓
controllers/...   → Task.getAll()                        调 Model，包装 JSON
  ↓
models/Task.js    → db.prepare('SELECT * FROM tasks')    执行 SQL
  ↓
JSON 返回给浏览器
```

每一层只做自己份内的事：
- **Route** 不认识 SQL，只管 "哪个 URL 交给谁处理"
- **Controller** 不认识 SQL，只管 "从请求拿参数、调 Model、返回响应"
- **Model** 不认识 HTTP，只管 "执行 SQL 返回数据"

**3. req.params vs req.body**

| 来源 | 示例 | 说明 |
|------|------|------|
| `req.params` | URL 中的 `:id` | `/api/tasks/3` → `req.params.id` = `"3"` |
| `req.body` | 请求体中的 JSON | `POST` 时 `{"title":"吃午饭"}` → `req.body.title` |
| `req.query` | URL 问号后的参数 | `/api/tasks?status=todo` → `req.query.status` |

**4. HTTP 状态码**

| 码 | 含义 | 什么时候用 |
|------|------|------|
| 200 | OK | GET / PUT 成功 |
| 201 | Created | POST 创建成功 |
| 400 | Bad Request | 用户输入不合法（如标题为空） |
| 404 | Not Found | 请求的资源不存在 |

**5. express.Router() —— 模块化路由**

```js
const router = express.Router();
router.get('/', ...);    // 定义子路由
router.post('/', ...);

app.use('/api/tasks', router);  // 挂载到 /api/tasks 前缀下
```

好处：每个资源（tasks、users）各自一个路由文件，互不干扰。不用把所有接口搬进 index.js。

### 三、遇到的坑与解决方案

无所遇坑，一路通畅。

### 四、代码片段示例

**MVC 三件套完整代码：**

```
server/
├── db/connection.js           ← 共享数据库连接（4 行）
├── models/Task.js             ← M：6 个 SQL 方法
├── controllers/taskController.js  ← C：参数验证 + 调用 Model + 返回响应
├── routes/tasks.js            ← R：URL → Controller 映射
└── index.js                   ← app.use('/api/tasks', tasksRouter)
```

**models/Task.js —— 数据操作层**
```js
const db = require('../db/connection');

const Task = {
  getAll() {
    return db.prepare('SELECT * FROM tasks ORDER BY position').all();
  },
  getById(id) {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },
  create(title, description) {
    const result = db.prepare(
      'INSERT INTO tasks (title, description) VALUES (?, ?)'
    ).run(title, description);
    return this.getById(result.lastInsertRowid);  // 返回刚创建的任务
  },
  update(id, title, description) {
    db.prepare(
      "UPDATE tasks SET title = ?, description = ?, updated_at = datetime('now','localtime') WHERE id = ?"
    ).run(title, description, id);
    return this.getById(id);
  },
  remove(id) {
    return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  },
  move(id, status, position) {
    db.prepare(
      "UPDATE tasks SET status = ?, position = ?, updated_at = datetime('now','localtime') WHERE id = ?"
    ).run(status, position, id);
    return this.getById(id);
  },
};

module.exports = Task;
```

**controllers/taskController.js —— 业务逻辑层**
```js
const Task = require('../models/Task');

const taskController = {
  getAll(req, res) {
    const tasks = Task.getAll();
    res.json(tasks);
  },
  getById(req, res) {
    const task = Task.getById(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json(task);
  },
  create(req, res) {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    const task = Task.create(title, description || '');
    res.status(201).json(task);
  },
  update(req, res) {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    const task = Task.update(Number(req.params.id), title, description || '');
    res.json(task);
  },
  remove(req, res) {
    Task.remove(Number(req.params.id));
    res.json({ success: true });
  },
  move(req, res) {
    const { status, position } = req.body;
    const task = Task.move(Number(req.params.id), status, position);
    res.json(task);
  },
};

module.exports = taskController;
```

**routes/tasks.js —— 路由映射层**
```js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.remove);
router.patch('/:id/move', taskController.move);

module.exports = router;
```

### 五、验证命令

```bash
# 启动服务器
node server/index.js

# 另一个终端测试接口
curl http://localhost:3001/api/tasks                    # 获取所有
curl -X POST http://localhost:3001/api/tasks -H "Content-Type: application/json" -d '{"title":"新任务","description":"描述"}'
curl -X PUT http://localhost:3001/api/tasks/1 -H "Content-Type: application/json" -d '{"title":"修改后的标题"}'
curl -X DELETE http://localhost:3001/api/tasks/1
curl -X PATCH http://localhost:3001/api/tasks/2/move -H "Content-Type: application/json" -d '{"status":"done","position":1}'
```

### 六、补充知识

**1. API 就是远程的 getter/setter**

面向对象中 `obj.getXxx()` / `obj.setXxx()` 在同一个进程内调用，API 的 GET/POST/PUT 通过网络调用。本质一样（封装数据的读写），区别只是调用方式。

**2. `lastInsertRowid` 是什么？**

SQLite 中每张有 AUTOINCREMENT 主键的表，插入后会返回自增的 id 值。`result.lastInsertRowid` 就是刚才 INSERT 生成的主键。用它可以立即查回完整记录返回给前端，不用再发起一次查询。

**3. `Number(req.params.id)` 为什么这样写？**

URL 参数永远是字符串类型（`"3"` 不是 `3`）。SQLite 的 `WHERE id = ?` 能自动处理类型转换，但显式 `Number()` 是良好习惯，避免 `WHERE id = "3abc"` 之类的问题。

---

## Day 4：前端组件设计与布局

**日期**：2026-05-29

### 一、本阶段目标回顾

搭建 React 组件树，实现三列看板布局，应用青橙双色调（cyan-orange）赛博朋克风格。

- 组件树：App → Board → Column → Card + AddCardForm
- 自定义光标 + 粒子拖尾 + Canvas 粒子网络背景
- 每列独立配色：待办(橙) / 进行中(青) / 完成(青绿)

### 二、核心概念解析

**1. React 组件树与单向数据流**

```
App (tasks state)
 ├── Board (接收 tasks, onAdd)
 │   ├── Column[0] (接收 status="todo", filtered tasks)
 │   │   ├── Card[0], Card[1]... (接收 title, description, status)
 │   │   └── AddCardForm (接收 onAdd 回调)
 │   ├── Column[1] (status="in-progress")
 │   └── Column[2] (status="done")
 └── Background (Canvas 粒子)
```

数据只从父传子（props），子组件通过回调（onAdd）通知父组件。state 只属于 App，Board/Column/Card 都是纯展示。

**2. 自定义光标原理**

```js
// 三步实现：
// ① CSS: body { cursor: none; } 隐藏原生光标
// ② requestAnimationFrame 驱动自定义 DOM 元素跟随鼠标
// ③ lerp（线性插值）平滑：当前位置 += (目标位置 - 当前位置) * 0.25
```

拖尾粒子用级联延迟：第 i 个粒子追第 i-1 个位置，形成蛇形跟随。

**3. Canvas 粒子背景**

- `canvas` 覆盖全视口，`pointer-events: none` 不拦截点击
- 80 个粒子分橙/青/青绿三色
- 鼠标 180px 范围内粒子被推开
- 同色粒子间距 < 130px 画半透明连线 → 星图效果
- `requestAnimationFrame` 驱动 60fps 动画

**4. `useRef` 直接操作 DOM，不触发重渲染**

`useLiquidCursor` hook 中用 `useRef` 存 DOM 引用和位置，用 `requestAnimationFrame` 直接操作 `style.transform`。这比 `useState` + React 重渲染快得多——60fps 动画不能每帧走 React 的 diff 流程。

### 三、遇到的坑与解决方案

| 坑 | 原因 | 解决 |
|----|------|------|
| 导入项目根目录的 background.jpg | Vite 只服务 `client/` 下的文件 | 复制到 `client/public/`，用绝对路径 `/background.jpg` 引用 |
| 粒子性能 | Canvas 在每次 resize 时需要重新初始化 | resize 事件只更新宽高，粒子数组不变 |
| nth-child 选择器 | Column 是动态渲染的，不能依赖 status class | CSS 用 `:nth-child(1/2/3)` 分别给三列配色 |
| 背景太暗看不到 | blur(12px) + brightness(0.12) 太高 | 调为 blur(4px) + brightness(0.28) |

### 四、组件文件总览

| 文件 | 职责 | 行数 |
|------|------|------|
| `index.css` | 全局样式 + CSS 变量 + 动画 | ~240 |
| `Background.jsx` | Canvas 粒子网络 + 鼠标交互 | ~110 |
| `App.jsx` | 根组件：state + 自定义光标 + 背景图 | ~135 |
| `Board.jsx` | 三列排列 + 按 status 分组 | ~18 |
| `Column.jsx` | 列标题 + Card 列表 + AddCardForm + 空状态 | ~28 |
| `Card.jsx` | 展示标题 + 描述 + 状态左色条 | ~9 |
| `AddCardForm.jsx` | 展开/收起输入框 + 回车提交 | ~38 |

### 五、color scheme 设计

| 列 | 主色 | 用途 |
|------|------|------|
| 待办 (todo) | `#f15a24` 橙 | dot / border-left / btn-primary / input focus glow |
| 进行中 (in-progress) | `#00b8d4` 青 | dot / border-left / btn-primary / input focus glow |
| 已完成 (done) | `#0d9488` 青绿 | dot / border-left / btn-primary / input focus glow |

三列 hover 时的边框色、阴影色、header 底线、顶线都跟随各自的颜色。

### 六、补充知识

**1. `backdrop-filter` vs `filter`**

- `filter: blur(10px)`：元素**自身**变模糊
- `backdrop-filter: blur(10px)`：元素**背后**的内容变模糊（毛玻璃效果）

Column 用的 `backdrop-filter: blur(16px)` 让列面板后面的粒子/背景图变模糊，面板本身清晰。

**2. requestAnimationFrame 为什么适合动画？**

- 浏览器在每次重绘前调用，自动同步到屏幕刷新率（通常 60fps）
- 页面切到后台时自动暂停，不浪费 CPU
- `setInterval` 做不到这两点

在本项目中，光标追踪和背景粒子都用 rAF 驱动。

**3. 为什么自定义光标要操作 DOM 而不走 React state？**

React 的 `setState` → diff → 重渲染每帧要几毫秒，60fps 动画下每帧预算只有 16ms。用 `useRef` + 直接 DOM 操作（`el.style.transform = ...`）免去 React 的中间层，保持丝滑。

---

## Day 5：前后端联调

**日期**：2026-05-29

### 一、目标

前端不再用硬编码假数据，改为通过 HTTP 请求从后端 API 获取数据库真实数据。

### 二、新建文件

**services/api.js** — 封装 5 个 fetch 函数：
- `getTasks()` → GET /api/tasks
- `createTask(title, description)` → POST /api/tasks
- `updateTask(id, title, description)` → PUT /api/tasks/:id
- `deleteTask(id)` → DELETE /api/tasks/:id
- `moveTask(id, status, position)` → PATCH /api/tasks/:id/move

**hooks/useTasks.js** — 任务状态管理 hook：
- `useState` 存 tasks / loading / error
- `useEffect([], ...)` 首次加载自动 fetch
- `addTask` / `removeTask` / `handleMoveTask` 三个操作函数

### 三、改造文件

- **App.jsx**：删 `initialTasks`，改用 `useTasks()`，传递 `onDelete` / `onMove`
- **Board.jsx**：接收 `onDelete` / `onMove`
- **Column.jsx**：透传 `onDelete`，Card 多传 `id`
- **Card.jsx**：新增删除按钮（hover 显示 ✕）
- **index.css**：`.card-delete` 样式

### 四、核心概念

- `fetch` → 浏览器内置 HTTP 客户端
- `async/await` → 异步代码同步化写法
- `useEffect([], ...)` → 组件挂载后执行一次
- `useCallback` → 缓存函数引用，避免无关重渲染
- **服务层抽离** → API 调用集中在 services/，组件只关心数据不关心网络细节

### 五、数据流

```
SQLite → Express API → fetch('/api/tasks') → useTasks hook → App → Board → Column → Card
```

---

## Day 6：拖拽功能 + 交互完善

**日期**：2026-05-29

### 一、拖拽库

安装 `@hello-pangea/dnd`（React 18/19 兼容的 react-beautiful-dnd 继任者）。

### 二、架构

```
DragDropContext (Board)
  └── Droppable (Column × 3, droppableId = status)
        └── Draggable (Card, draggableId = String(id))
```

- `onDragEnd` 拿到 `source`（原位置）和 `destination`（目标位置）
- 乐观更新：先改本地 state，再发 API 持久化

### 三、改动

| 文件 | 改动 |
|------|------|
| `Board.jsx` | 加 DragDropContext + onDragEnd 逻辑 |
| `Column.jsx` | 列表区包 Droppable，`snapshot.isDraggingOver` 高亮 |
| `Card.jsx` | 包 Draggable，`snapshot.isDragging` 旋转+阴影 |
| `useTasks.js` | 加 `handleMoveTask` 乐观更新 |
| `App.jsx` | 传递 `onMove`，加 loading / error 状态展示 |
| `index.css` | `.dragging` `.dragging-over` `.loading` `.error` 样式 |

### 四、移除

- 自定义光标 + 粒子拖尾（`useCustomCursor` hook、`.cursor-dot`、`.cursor-ring`、`cursor: none` 全部删除）
- 恢复系统默认鼠标指针