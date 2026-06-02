/**
 * API 服务层 — 封装所有后端 HTTP 请求
 *
 * BASE = '/api'，通过 Vite proxy 转发到 localhost:3001。
 * 所有函数返回 fetch 的 res.json() Promise。
 *
 * 认证机制：
 *   通过 VITE_API_KEY 环境变量注入 API Key，自动附加到所有请求的 X-API-Key 头。
 *   未设置 VITE_API_KEY 时不发送该头（向后兼容开发环境）。
 *
 * 模块划分：
 *   Boards    — 板块 CRUD
 *   Tasks     — 任务 CRUD + 搜索 + 回收站 + 移动 + 置顶
 *   Subtasks  — 子任务 CRUD + toggle
 *   Attachments — 附件上传/查询/删除
 *   Timer     — 计时器读写
 */

const BASE = '/api';
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * 封装 fetch，自动附加 API Key 和 JSON 头。
 * @param {string} url - 请求路径
 * @param {object} options - fetch 选项（method/headers/body）
 * @returns {Promise<Response>}
 */
function apiFetch(url, options = {}) {
  const headers = { ...options.headers };
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  return fetch(url, { ...options, headers });
}

// ═══════════════════════════════════════
//  Boards — 板块 API
// ═══════════════════════════════════════
export async function getBoards() {
  const res = await apiFetch(`${BASE}/boards`);
  return res.json();
}
export async function createBoard(name) {
  const res = await apiFetch(`${BASE}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}
export async function deleteBoard(id) {
  await apiFetch(`${BASE}/boards/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════
//  Tasks — 任务 API
// ═══════════════════════════════════════
export async function getTasks(boardId) {
  const url = boardId ? `${BASE}/tasks?board_id=${boardId}` : `${BASE}/tasks`;
  const res = await apiFetch(url);
  return res.json();
}
export async function searchTasks(keyword, boardId) {
  const params = new URLSearchParams({ search: keyword });
  if (boardId) params.set('board_id', boardId);
  const res = await apiFetch(`${BASE}/tasks?${params}`);
  return res.json();
}
export async function getDeletedTasks(boardId) {
  const params = new URLSearchParams({ deleted: 'true' });
  if (boardId) params.set('board_id', boardId);
  const res = await apiFetch(`${BASE}/tasks?${params}`);
  return res.json();
}
export async function createTask(title, description, boardId, priority, dueDate, color) {
  const res = await apiFetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, board_id: boardId, priority, due_date: dueDate, color }),
  });
  return res.json();
}
export async function updateTask(id, title, description, priority, dueDate, color) {
  const res = await apiFetch(`${BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, due_date: dueDate, color }),
  });
  return res.json();
}
export async function deleteTask(id) {
  await apiFetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
}
export async function restoreTask(id) {
  await apiFetch(`${BASE}/tasks/${id}/restore`, { method: 'PATCH' });
}
export async function permanentDeleteTask(id) {
  await apiFetch(`${BASE}/tasks/${id}/permanent`, { method: 'DELETE' });
}
export async function moveTask(id, status, position) {
  const res = await apiFetch(`${BASE}/tasks/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, position }),
  });
  return res.json();
}

// ═══════════════════════════════════════
//  Subtasks — 子任务 API
// ═══════════════════════════════════════
export async function getSubtasks(taskId) {
  const res = await apiFetch(`${BASE}/tasks/${taskId}/subtasks`);
  return res.json();
}
export async function createSubtask(taskId, title) {
  const res = await apiFetch(`${BASE}/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
}
export async function toggleSubtask(taskId, id) {
  const res = await apiFetch(`${BASE}/tasks/${taskId}/subtasks/${id}/toggle`, { method: 'PATCH' });
  return res.json();
}
export async function deleteSubtask(taskId, id) {
  await apiFetch(`${BASE}/tasks/${taskId}/subtasks/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════
//  Attachments — 附件 API
// ═══════════════════════════════════════
export async function getAttachments(taskId) {
  const res = await apiFetch(`${BASE}/tasks/${taskId}/attachments`);
  return res.json();
}
export async function uploadAttachment(taskId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetch(`${BASE}/tasks/${taskId}/attachments`, { method: 'POST', body: form });
  return res.json();
}
export async function deleteAttachment(taskId, id) {
  await apiFetch(`${BASE}/tasks/${taskId}/attachments/${id}`, { method: 'DELETE' });
}

// ═══════════════════════════════════════
//  Pin — 置顶 API
// ═══════════════════════════════════════
export async function togglePin(id) {
  const res = await apiFetch(`${BASE}/tasks/${id}/pin`, { method: 'PATCH' });
  return res.json();
}

// ═══════════════════════════════════════
//  Timer — 计时器 API
// ═══════════════════════════════════════
export async function getTimerTotal(taskId) {
  const res = await apiFetch(`${BASE}/tasks/${taskId}/timer`);
  return res.json();
}
export async function saveTimerDuration(taskId, duration) {
  const res = await apiFetch(`${BASE}/tasks/${taskId}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration }),
  });
  return res.json();
}
