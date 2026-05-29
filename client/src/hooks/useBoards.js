import { useState, useEffect, useCallback } from 'react';
import { getBoards, createBoard, deleteBoard } from '../services/api';

export default function useBoards() {
  const [boards, setBoards] = useState([]);
  const [activeId, setActiveId] = useState(1);

  const load = useCallback(() => {
    getBoards().then(list => {
      setBoards(list);
      if (list.length > 0 && !list.find(b => b.id === activeId)) {
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
    setBoards(prev => prev.filter(b => b.id !== id));
    if (activeId === id) {
      setBoards(prev => {
        const remaining = prev.filter(b => b.id !== id);
        if (remaining.length > 0) setActiveId(remaining[0].id);
        return remaining;
      });
    }
  }, [activeId]);

  return { boards, activeId, setActiveId, addBoard, removeBoard, reload: load };
}
