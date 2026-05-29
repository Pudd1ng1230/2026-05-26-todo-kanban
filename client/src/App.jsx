import { useState, useEffect, useRef } from 'react';
import Board from './components/Board';
import Background from './components/Background';
import './index.css';

const initialTasks = [
  { id: 1, title: '学习数据库设计', description: 'SQLite + better-sqlite3', status: 'done' },
  { id: 2, title: '实现后端 API', description: 'Express 增删改查', status: 'in-progress' },
  { id: 3, title: '搭建前端组件', description: 'React 组件树', status: 'todo' },
  { id: 4, title: '实现拖拽功能', description: '@hello-pangea/dnd', status: 'todo' },
];

const TRAIL_COUNT = 14;

function useCustomCursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const frameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    const trailContainer = document.createElement('div');
    trailContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;';
    document.body.appendChild(trailContainer);

    const trailDots = [];
    const trailColors = [
      '#f15a24', '#f15a24', '#f15a24', '#f15a24', '#f15a24',
      '#00b8d4', '#00b8d4', '#00b8d4', '#00b8d4', '#00b8d4',
      '#f15a24', '#00b8d4', '#0d9488', '#0d9488',
    ];

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:fixed;width:4px;height:4px;
        border-radius:50%;background:${trailColors[i]};
        pointer-events:none;z-index:9998;
        opacity:0;transform:translate(-50%,-50%);
        box-shadow: 0 0 3px ${trailColors[i]};
      `;
      trailContainer.appendChild(dot);
      trailDots.push({ el: dot, x: -100, y: -100 });
    }

    const onMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const animate = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      currentRef.current.x += (mx - currentRef.current.x) * 0.25;
      currentRef.current.y += (my - currentRef.current.y) * 0.25;
      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

      for (let i = 0; i < trailDots.length; i++) {
        const dot = trailDots[i];
        const target = i === 0 ? { x: mx, y: my } : { x: trailDots[i - 1].x, y: trailDots[i - 1].y };
        dot.x += (target.x - dot.x) * (0.35 - i * 0.018);
        dot.y += (target.y - dot.y) * (0.35 - i * 0.018);
        const alpha = 0.55 * (1 - i / trailDots.length);
        dot.el.style.opacity = alpha;
        const size = 4.5 * (1 - i / trailDots.length);
        dot.el.style.width = size + 'px';
        dot.el.style.height = size + 'px';
        dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frameRef.current);
      trailContainer.remove();
    };
  }, []);

  return { cursorRef, ringRef };
}

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const { cursorRef, ringRef } = useCustomCursor();

  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = ''; };
  }, []);

  const handleAdd = (status, title) => {
    const newTask = {
      id: Date.now(),
      title,
      description: '',
      status,
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <>
      {/* Background image with blur overlay */}
      <div className="bg-image">
        <img src="/background.jpg" alt="" />
      </div>

      <Background />

      {/* Custom cursor */}
      <div ref={cursorRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />

      <div className="app">
        <header className="app-header">
          <h1>Todo 看板</h1>
          <p className="subtitle">Kanban Board</p>
          <div className="header-divider" />
        </header>
        <Board tasks={tasks} onAdd={handleAdd} />
      </div>
    </>
  );
}

export default App;
