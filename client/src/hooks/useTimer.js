import { useState, useRef, useCallback, useEffect } from 'react';
import { getTimerTotal, saveTimerDuration } from '../services/api';

export default function useTimer(taskId) {
  const [elapsed, setElapsed] = useState(0);     // 当前会话秒数
  const [running, setRunning] = useState(false);
  const [savedTotal, setSavedTotal] = useState(0); // 后端累计秒数
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    getTimerTotal(taskId).then(r => setSavedTotal(r.total));
  }, [taskId]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }, [elapsed]);

  const pause = useCallback(() => {
    setRunning(false);
    if (elapsed > 0) {
      saveTimerDuration(taskId, elapsed);
      setSavedTotal(prev => prev + elapsed);
    }
    // 不再 reset elapsed，暂停时显示保持不动
  }, [elapsed, taskId]);

  const toggle = useCallback(() => {
    if (running) pause(); else start();
  }, [running, start, pause]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { elapsed, savedTotal, running, display, start, pause, reset, toggle };
}
