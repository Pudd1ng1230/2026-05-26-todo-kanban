const BASE_URL = '/api/tasks';

export async function getTasks() {
  const res = await fetch(BASE_URL);
  return res.json();
}

export async function createTask(title, description = '') {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  return res.json();
}

export async function updateTask(id, title, description) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  return res.json();
}

export async function deleteTask(id) {
  await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
}

export async function moveTask(id, status, position) {
  const res = await fetch(`${BASE_URL}/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, position }),
  });
  return res.json();
}
