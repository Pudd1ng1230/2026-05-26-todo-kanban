import { useState, useEffect, useCallback } from 'react';
import {
  getTasks, createTask, updateTask, deleteTask, restoreTask,
  permanentDeleteTask, moveTask, searchTasks, getDeletedTasks,
} from '../services/api';

export default function useTasks(boardId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(() => {
    setLoading(true);
    getTasks(boardId)
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [boardId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = useCallback(async (status, title, description = '', priority = 'medium', dueDate = '', color = '') => {
    const newTask = await createTask(title, description, boardId, priority, dueDate || null, color || null);
    await moveTask(newTask.id, status, 0);
    setTasks(prev => [...prev, { ...newTask, status }]);
  }, [boardId]);

  const removeTask = useCallback(async (id) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const editTask = useCallback(async (id, title, description, priority, dueDate, color) => {
    const updated = await updateTask(id, title, description, priority, dueDate, color);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  }, []);

  const handleMoveTask = useCallback(async (taskId, newStatus, newPosition) => {
    setTasks(prev => {
      const dragged = prev.find(t => t.id === taskId);
      if (!dragged) return prev;
      const oldStatus = dragged.status;

      if (oldStatus === newStatus) {
        // 同列重排
        const col = prev
          .filter(t => t.status === newStatus)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        const without = col.filter(t => t.id !== taskId);
        without.splice(newPosition, 0, dragged);
        const reordered = without.map((t, i) => ({ ...t, position: i }));
        return prev.map(t => reordered.find(r => r.id === t.id) || t);
      } else {
        // 跨列：从旧列移除，插入新列
        const updatedDragged = { ...dragged, status: newStatus };
        const oldCol = prev
          .filter(t => t.status === oldStatus && t.id !== taskId)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((t, i) => ({ ...t, position: i }));
        const newCol = prev
          .filter(t => t.status === newStatus)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        newCol.splice(newPosition, 0, updatedDragged);
        const reorderedNew = newCol.map((t, i) => ({ ...t, position: i }));
        return prev.map(t => {
          const o = oldCol.find(x => x.id === t.id);
          if (o) return o;
          const n = reorderedNew.find(x => x.id === t.id);
          if (n) return n;
          return t;
        });
      }
    });
    await moveTask(taskId, newStatus, newPosition);
  }, []);

  const search = useCallback(async (keyword) => {
    if (!keyword.trim()) { loadTasks(); return; }
    setLoading(true);
    searchTasks(keyword, boardId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [boardId, loadTasks]);

  return { tasks, loading, error, addTask, removeTask, editTask, handleMoveTask, search, reload: loadTasks };
}

export function useRecycleBin(boardId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getDeletedTasks(boardId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [boardId]);

  useEffect(() => { load(); }, [load]);

  const restore = useCallback(async (id) => {
    await restoreTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const permanentDelete = useCallback(async (id) => {
    await permanentDeleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, restore, permanentDelete, reload: load };
}
