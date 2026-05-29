
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