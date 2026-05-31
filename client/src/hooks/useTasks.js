/**
 * useTasks — 任务状态管理 Hook
 *
 * 核心职责：
 *   1. 加载任务列表（支持按板块筛选）
 *   2. 增删改操作 + 乐观更新
 *   3. 拖拽移动 — 先乐观更新本地 state，再异步持久化到后端
 *   4. 搜索 — 关键字为空时重置为全量加载
 *   5. 置顶切换
 *
 * 乐观更新策略：拖拽时立刻重排本地数组（UI 秒响应），
 * 同时异步调用 moveTask API。如果 API 失败，下次 loadTasks 会覆盖为正确数据。
 *
 * useRecycleBin（导出）— 回收站专用 Hook，复用 getDeletedTasks / restoreTask / permanentDeleteTask。
 *
 * @param {number} boardId — 当前板块 ID
 * @returns {{ tasks, loading, error, addTask, removeTask, editTask, handleMoveTask, handleTogglePin, search, reload }}
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getTasks, createTask, updateTask, deleteTask, restoreTask,
  permanentDeleteTask, moveTask, searchTasks, getDeletedTasks, togglePin,
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
    let wasCrossColumn = false;

    setTasks(prev => {
      const dragged = prev.find(t => t.id === taskId);
      if (!dragged) return prev;
      const oldStatus = dragged.status;
      wasCrossColumn = oldStatus !== newStatus;

      if (!wasCrossColumn) {
        // 同列重排：保持所有属性（包括 pinned），只更新 position
        const col = prev
          .filter(t => t.status === newStatus)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        const without = col.filter(t => t.id !== taskId);
        without.splice(newPosition, 0, dragged);
        const reordered = without.map((t, i) => ({ ...t, position: i }));
        return prev.map(t => reordered.find(r => r.id === t.id) || t);
      } else {
        // 跨列移动：更新 status 和 position，但保留 pinned（置顶状态跟随卡片，不自动取消）
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

    // 只持久化状态和位置到后端，pinned 由 togglePin 接口单独管理
    await moveTask(taskId, newStatus, newPosition);
  }, []);

  const handleTogglePin = useCallback(async (taskId) => {
    const updated = await togglePin(taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }, []);

  const search = useCallback(async (keyword) => {
    if (!keyword.trim()) { loadTasks(); return; }
    setLoading(true);
    searchTasks(keyword, boardId)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [boardId, loadTasks]);

  return { tasks, loading, error, addTask, removeTask, editTask, handleMoveTask, handleTogglePin, search, reload: loadTasks };
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
