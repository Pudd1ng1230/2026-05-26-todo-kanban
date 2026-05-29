import { useState } from 'react';

export default function AddCardForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button className="btn-add" onClick={() => setOpen(true)}>
        + 添加卡片
      </button>
    );
  }

  return (
    <div className="add-card-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入卡片标题..."
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <div className="add-card-buttons">
        <button className="btn btn-primary" onClick={handleAdd}>添加</button>
        <button className="btn btn-secondary" onClick={() => { setOpen(false); setTitle(''); }}>取消</button>
      </div>
    </div>
  );
}
