/**
 * useBoards — 板块状态管理 Hook
 *
 * 职责：
 *   - 加载板块列表并维护 activeId（当前激活的板块）
 *   - 新建 / 删除板块后自动调整 activeId
 *   - 使用 useRef 避免 removeBoard 回调中的闭包过期问题
 *
 * @returns {{ boards, activeId, setActiveId, addBoard, removeBoard, reload }}
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getBoards, createBoard, deleteBoard } from '../services/api';

export default function useBoards() {
  const [boards, setBoards] = useState([]);
  const [activeId, setActiveId] = useState(1);
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  const load = useCallback(() => {
    getBoards().then(list => {
      setBoards(list);
      if (list.length > 0 && !list.find(b => b.id === activeRef.current)) {
        setActiveId(list[0].id);
      }
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const addBoard = useCallback(async (name) => {
    const board = await createBoard(name);
    setBoards(prev => [...prev, board]);
    setActiveId(board.id);
  }, []);

  const removeBoard = useCallback(async (id) => {
    await deleteBoard(id);
    setBoards(prev => {
      const remaining = prev.filter(b => b.id !== id);
      if (activeRef.current === id && remaining.length > 0) {
        setActiveId(remaining[0].id);
      }
      return remaining;
    });
  }, []);

  return { boards, activeId, setActiveId, addBoard, removeBoard, reload: load };
}
