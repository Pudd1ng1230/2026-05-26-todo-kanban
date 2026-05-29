import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, deleteTask, moveTask } from '../services/api';

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 页面首次加载时，从后端获取所有任务
  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addTask = useCallback(async (status, title) => {
    const newTask = await createTask(title);
    // 创建成功后，用后端返回的 move 设置 status
    await fetch(`/api/tasks/${newTask.id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, position: 0 }),
    });
    setTasks(prev => [...prev, { ...newTask, status }]);
  }, []);

  const removeTask = useCallback(async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleMoveTask = useCallback(async (taskId, newStatus, newPosition) => {
    // 乐观更新：先改本地状态，再发请求
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
    ));
    await moveTask(taskId, newStatus, newPosition);
  }, []);

  return { tasks, loading, error, addTask, removeTask, handleMoveTask };
}
