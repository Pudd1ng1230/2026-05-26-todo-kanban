import { useState } from 'react';

export default function AddCardForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim(), desc.trim());
      setTitle('');
      setDesc('');
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="描述（可选）..."
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <div className="add-card-buttons">
        <button className="btn btn-primary" onClick={handleAdd}>添加</button>
        <button className="btn btn-secondary" onClick={() => { setOpen(false); setTitle(''); setDesc(''); }}>取消</button>
      </div>
    </div>
  );
}
