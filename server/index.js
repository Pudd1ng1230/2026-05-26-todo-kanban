const express = require('express');

const app = express();
const PORT = 3001;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 一个测试接口，验证服务器是否正常运行
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
