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
            <span className="board-tab-del" onClick={() => onDelete(b.id)} title="删除板块">×</span>
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
