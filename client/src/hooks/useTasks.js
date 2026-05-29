import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, deleteTask, moveTask } from '../services/api';

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addTask = useCallback(async (status, title) => {
    const newTask = await createTask(title);
    await moveTask(newTask.id, status, 0);
    setTasks(prev => [...prev, { ...newTask, status }]);
  }, []);

  const removeTask = useCallback(async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleMoveTask = useCallback(async (taskId, newStatus, newPosition) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
    ));
    await moveTask(taskId, newStatus, newPosition);
  }, []);

  return { tasks, loading, error, addTask, removeTask, handleMoveTask };
}
