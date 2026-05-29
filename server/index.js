const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());

// 静态文件：上传的附件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/boards', require('./routes/boards'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/tasks/:taskId/subtasks', require('./routes/subtasks'));
app.use('/api/tasks/:taskId/attachments', require('./routes/attachments'));
app.use('/api/tasks/:taskId/timer', require('./routes/timer'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
