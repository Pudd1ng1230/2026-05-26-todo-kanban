import { useState, useRef, useCallback, useEffect } from 'react';
import { getTimerTotal, saveTimerDuration } from '../services/api';

export default function useTimer(taskId) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [savedTotal, setSavedTotal] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // 加载已保存的累计时长
  useEffect(() => {
    getTimerTotal(taskId).then(r => setSavedTotal(r.total));
  }, [taskId]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }, [elapsed]);

  const pause = useCallback(() => {
    setRunning(false);
    // 保存本次计时
    if (elapsed > 0) {
      saveTimerDuration(taskId, elapsed);
      setSavedTotal(prev => prev + elapsed);
    }
    setElapsed(0);
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

  // display 只显示当前会话的计时，累计时长通过 savedTotal 单独展示
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { elapsed, savedTotal, running, display, start, pause, reset, toggle };
}
