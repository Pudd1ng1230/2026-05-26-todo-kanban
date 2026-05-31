/**
 * Background — Canvas 粒子背景动画
 *
 * 使用 requestAnimationFrame 驱动，不经过 React 渲染周期（性能优化）。
 *
 * 效果：
 *   - 40 个随机色粒子（橙/青/青绿）缓慢漂移
 *   - 鼠标 150px 范围内粒子被推开
 *   - 同色粒子间距 < 120px 时绘制半透明连线 → 星图效果
 *   - 鼠标附近粒子变亮
 *
 * Canvas 覆盖全视口，pointer-events: none 不拦截点击。
 */

import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 40;       // 粒子数量
const CONNECT_DIST = 120;        // 连线距离阈值
const MOUSE_INFLUENCE = 150;     // 鼠标排斥半径

const COLORS = [
  { r: 241, g: 90, b: 36 },   // orange
  { r: 0, g: 184, b: 212 },   // cyan
  { r: 13, g: 148, b: 136 },  // teal
];

export default function Background() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles with random colors
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        color,
      });
    }

    const onMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_INFLUENCE) {
          const force = (MOUSE_INFLUENCE - dist) / MOUSE_INFLUENCE * 0.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const dToMouse = Math.hypot(p.x - mx, p.y - my);
        const glowBoost = dToMouse < 200 ? (200 - dToMouse) / 200 * 0.5 : 0;
        const alpha = 0.12 + glowBoost;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glowBoost * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`;
        ctx.fill();
      }

      // Draw connections - same color group only
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST && particles[i].color === particles[j].color) {
            const c = particles[i].color;
            const alpha = (1 - dist / CONNECT_DIST) * 0.05;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
