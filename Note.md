
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