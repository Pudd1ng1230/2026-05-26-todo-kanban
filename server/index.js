const express = require('express');

const app = express();
const PORT = 3001;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 路由
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
