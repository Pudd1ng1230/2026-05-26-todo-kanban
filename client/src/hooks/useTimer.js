/**
 * useTimer — 计时器 Hook
 *
 * 设计：
 *   - 使用 Date.now() 计算真实耗时（而非累加 setInterval 次数），避免定时器漂移
 *   - 暂停时保存本次 duration 到后端，并累加到 savedTotal
 *   - elapsed 在暂停后保持不变（显示最后计时值），reset 清零
 *   - savedTotal 从后端加载，与本地 elapsed 分离显示
 *
 * @param {number} taskId — 关联的任务 ID
 * @returns {{ elapsed, savedTotal, running, display, start, pause, reset, toggle }}
 */

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
