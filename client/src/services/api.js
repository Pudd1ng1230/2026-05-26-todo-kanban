const BASE = '/api';

// ── Boards ──
export async function getBoards() {
  const res = await fetch(`${BASE}/boards`);
  return res.json();
}
export async function createBoard(name) {
  const res = await fetch(`${BASE}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}
export async function deleteBoard(id) {
  await fetch(`${BASE}/boards/${id}`, { method: 'DELETE' });
}

// ── Tasks ──
export async function getTasks(boardId) {
  const url = boardId ? `${BASE}/tasks?board_id=${boardId}` : `${BASE}/tasks`;
  const res = await fetch(url);
  return res.json();
}
export async function searchTasks(keyword, boardId) {
  const params = new URLSearchParams({ search: keyword });
  if (boardId) params.set('board_id', boardId);
  const res = await fetch(`${BASE}/tasks?${params}`);
  return res.json();
}
export async function getDeletedTasks(boardId) {
  const params = new URLSearchParams({ deleted: 'true' });
  if (boardId) params.set('board_id', boardId);
  const res = await fetch(`${BASE}/tasks?${params}`);
  return res.json();
}
export async function createTask(title, description, boardId, priority, dueDate, color) {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, board_id: boardId, priority, due_date: dueDate, color }),
  });
  return res.json();
}
export async function updateTask(id, title, description, priority, dueDate, color) {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority, due_date: dueDate, color }),
  });
  return res.json();
}
export async function deleteTask(id) {
  await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
}
export async function restoreTask(id) {
  await fetch(`${BASE}/tasks/${id}/restore`, { method: 'PATCH' });
}
export async function permanentDeleteTask(id) {
  await fetch(`${BASE}/tasks/${id}/permanent`, { method: 'DELETE' });
}
export async function moveTask(id, status, position) {
  const res = await fetch(`${BASE}/tasks/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, position }),
  });
  return res.json();
}

// ── Subtasks ──
export async function getSubtasks(taskId) {
  const res = await fetch(`${BASE}/tasks/${taskId}/subtasks`);
  return res.json();
}
export async function createSubtask(taskId, title) {
  const res = await fetch(`${BASE}/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
}
export async function toggleSubtask(id) {
  const res = await fetch(`${BASE}/tasks/0/subtasks/${id}/toggle`, { method: 'PATCH' });
  return res.json();
}
export async function deleteSubtask(id) {
  await fetch(`${BASE}/tasks/0/subtasks/${id}`, { method: 'DELETE' });
}

// ── Attachments ──
export async function getAttachments(taskId) {
  const res = await fetch(`${BASE}/tasks/${taskId}/attachments`);
  return res.json();
}
export async function uploadAttachment(taskId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/tasks/${taskId}/attachments`, { method: 'POST', body: form });
  return res.json();
}
export async function deleteAttachment(id) {
  await fetch(`${BASE}/tasks/0/attachments/${id}`, { method: 'DELETE' });
}

// ── Pin ──
export async function togglePin(id) {
  const res = await fetch(`${BASE}/tasks/${id}/pin`, { method: 'PATCH' });
  return res.json();
}

// ── Timer ──
export async function getTimerTotal(taskId) {
  const res = await fetch(`${BASE}/tasks/${taskId}/timer`);
  return res.json();
}
export async function saveTimerDuration(taskId, duration) {
  const res = await fetch(`${BASE}/tasks/${taskId}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration }),
  });
  return res.json();
}
