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
