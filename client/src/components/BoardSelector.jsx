/**
 * BoardSelector — 板块切换标签栏
 *
 * 展示所有板块为可点击的标签（tab），当前激活板块有高亮样式。
 * 支持新建板块（内联输入框）和删除板块（× 按钮，至少保留一个）。
 *
 * @param {Array} boards — 板块列表 [{id, name}, ...]
 * @param {number} activeId — 当前激活板块 ID
 * @param {Function} onSelect(id) — 切换板块回调
 * @param {Function} onAdd(name) — 新建板块回调
 * @param {Function} onDelete(id) — 删除板块回调
 */

import { useState } from 'react';

export default function BoardSelector({ boards, activeId, onSelect, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setAdding(false);
    }
  };

  return (
    <div className="board-selector">
      {boards.map(b => (
        <div key={b.id} className={`board-tab ${b.id === activeId ? 'active' : ''}`}>
          <button onClick={() => onSelect(b.id)}>{b.name}</button>
          {boards.length > 1 && (
            <span className="board-tab-del" onClick={() => { if (window.confirm(`删除板块「${b.name}」？`)) onDelete(b.id); }} title="删除板块">×</span>
          )}
        </div>
      ))}

      {adding ? (
        <div className="board-tab adding">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="板块名..."
            autoFocus
          />
          <button onClick={handleAdd}>✓</button>
          <button onClick={() => setAdding(false)}>×</button>
        </div>
      ) : (
        <button className="board-tab add" onClick={() => setAdding(true)}>+ 新建板块</button>
      )}
    </div>
  );
}
