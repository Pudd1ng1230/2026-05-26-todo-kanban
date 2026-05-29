const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(__dirname, 'todo.db'));

// 启用 WAL 模式提升并发
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── boards 表 ──
db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )
`);

// 插入默认板块（如果为空）
const boardCount = db.prepare('SELECT COUNT(*) as c FROM boards').get().c;
if (boardCount === 0) {
  db.prepare("INSERT INTO boards (name) VALUES ('默认看板')").run();
}

// ── tasks 表扩展 ──
// SQLite 不支持 ADD COLUMN IF NOT EXISTS，用 try-catch 包装
const taskColumns = db.prepare("PRAGMA table_info('tasks')").all().map(c => c.name);

if (!taskColumns.includes('board_id')) {
  db.exec("ALTER TABLE tasks ADD COLUMN board_id INTEGER DEFAULT 1");
}
if (!taskColumns.includes('priority')) {
  db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'");
}
if (!taskColumns.includes('due_date')) {
  db.exec("ALTER TABLE tasks ADD COLUMN due_date TEXT");
}
if (!taskColumns.includes('color')) {
  db.exec("ALTER TABLE tasks ADD COLUMN color TEXT");
}
if (!taskColumns.includes('deleted_at')) {
  db.exec("ALTER TABLE tasks ADD COLUMN deleted_at TEXT");
}

// ── subtasks 表 ──
db.exec(`
  CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0
  )
`);

// ── timer_sessions 表 ──
db.exec(`
  CREATE TABLE IF NOT EXISTS timer_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TEXT DEFAULT (datetime('now','localtime')),
    end_time TEXT,
    duration INTEGER DEFAULT 0
  )
`);

// ── attachments 表 + uploads 目录 ──
db.exec(`
  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )
`);

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

console.log('✅ 数据库迁移完成');
db.close();
