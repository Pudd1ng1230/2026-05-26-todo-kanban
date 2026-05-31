/**
 * AddCardForm — 新建卡片表单
 *
 * 渐进式展示：
 *   默认 → + 添加卡片 按钮
 *   点击 → 展开标题输入框 + 描述
 *   点"更多选项" → 展开优先级 / 截止日期 / 颜色选择器
 *
 * 支持回车快捷提交（不按 Shift 时）。
 *
 * @param {Function} onAdd(title, desc, priority, dueDate, color) — 提交回调
 */

import { useState } from 'react';

// 可选的 7 种卡片颜色
const COLORS = ['', '#f15a24', '#00b8d4', '#0d9488', '#7c3aed', '#eab308', '#ec4899'];

export default function AddCardForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState('');
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim(), desc.trim(), priority, dueDate, color);
      setTitle(''); setDesc(''); setPriority('medium'); setDueDate(''); setColor(''); setOpen(false); setShowMore(false);
    }
  };

  if (!open) {
    return <button className="btn-add" onClick={() => setOpen(true)}>+ 添加卡片</button>;
  }

  return (
    <div className="add-card-form">
      <input
        type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder="输入卡片标题..." autoFocus
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
      />
      <textarea
        value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="描述（可选）..." rows={2}
      />

      {!showMore && (
        <button type="button" className="btn-more" onClick={() => setShowMore(true)}>+ 更多选项</button>
      )}

      {showMore && (
        <div className="add-card-extra">
          <label>优先级</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>

          <label>截止日期</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />

          <label>颜色</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c || 'none'}
                className={`color-dot ${color === c ? 'active' : ''}`}
                style={c ? { background: c } : { background: 'transparent', border: '1px dashed #555' }}
                onClick={() => setColor(c === color ? '' : c)}
                title={c || '默认'}
              />
            ))}
          </div>
        </div>
      )}

      <div className="add-card-buttons">
        <button className="btn btn-primary" onClick={handleAdd}>添加</button>
        <button className="btn btn-secondary" onClick={() => { setOpen(false); setTitle(''); setDesc(''); }}>取消</button>
      </div>
    </div>
  );
}
