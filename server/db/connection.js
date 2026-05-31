/**
 * 数据库连接（单例）
 *
 * 整个 server 进程共享同一个 SQLite 连接实例。
 * better-sqlite3 是同步驱动 — 不需要 async/await，代码按行顺序执行。
 *
 * 数据库文件位置：server/db/todo.db
 */

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'todo.db'));

module.exports = db;
