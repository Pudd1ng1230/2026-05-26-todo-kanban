import { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import useTimer from '../hooks/useTimer';
import { getSubtasks, createSubtask, toggleSubtask, deleteSubtask } from '../services/api';
import { getAttachments, uploadAttachment, deleteAttachment } from '../services/api';

const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' };
const COLORS = ['', '#f15a24', '#00b8d4', '#0d9488', '#7c3aed', '#eab308', '#ec4899'];

export default function Card({ id, index, title, description, status, onDelete, onEdit, priority, dueDate, color }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description);
  const [editPriority, setEditPriority] = useState(priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(dueDate || '');
  const [editColor, setEditColor] = useState(color || '');
  const [showDetails, setShowDetails] = useState(false);

  // 子任务
  const [subtasks, setSubtasks] = useState([]);
  const [newSubTitle, setNewSubTitle] = useState('');

  // 附件
  const [attachments, setAttachments] = useState([]);

  const timer = useTimer(id);

  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'done';

  useEffect(() => {
    if (showDetails) {
      getSubtasks(id).then(setSubtasks);
      getAttachments(id).then(setAttachments);
    }
  }, [showDetails, id]);

  const startEdit = () => {
    setEditTitle(title);
    setEditDesc(description);
    setEditPriority(priority || 'medium');
    setEditDueDate(dueDate || '');
    setEditColor(color || '');
    setEditing(true);
  };

  const saveEdit = () => {
    if (editTitle.trim()) {
      onEdit(id, editTitle.trim(), editDesc.trim(), editPriority, editDueDate || null, editColor || null);
    }
    setEditing(false);
  };

  const addSubtask = async () => {
    if (!newSubTitle.trim()) return;
    const sub = await createSubtask(id, newSubTitle.trim());
    setSubtasks(prev => [...prev, sub]);
    setNewSubTitle('');
  };

  const toggleSub = async (subId) => {
    const updated = await toggleSubtask(subId);
    setSubtasks(prev => prev.map(s => s.id === subId ? updated : s));
  };

  const removeSub = async (subId) => {
    await deleteSubtask(subId);
    setSubtasks(prev => prev.filter(s => s.id !== subId));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const att = await uploadAttachment(id, file);
    setAttachments(prev => [...prev, att]);
  };

  const removeAtt = async (attId) => {
    await deleteAttachment(attId);
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const doneCount = subtasks.filter(s => s.completed).length;
  const subProgress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

  return (
    <Draggable draggableId={String(id)} index={index} isDragDisabled={editing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(editing ? {} : provided.dragHandleProps)}
          className={`card status-${status} priority-${priority || 'medium'} ${snapshot.isDragging ? 'dragging' : ''} ${isOverdue ? 'overdue' : ''}`}
          style={{
            ...provided.draggableProps.style,
            ...(color ? { borderLeftColor: color, '--card-accent': color } : {}),
          }}
        >
          {editing ? (
            <div className="card-edit-form">
              <input className="card-edit-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="标题" autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') setEditing(false); }} />
              <textarea className="card-edit-desc" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="描述" rows={2} />
              <div className="card-edit-row">
                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                  <option value="low">低优先级</option><option value="medium">中优先级</option><option value="high">高优先级</option>
                </select>
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
                <div className="color-picker">
                  {COLORS.map(c => (
                    <button key={c || 'none'} className={`color-dot ${editColor === c ? 'active' : ''}`}
                      style={c ? { background: c } : { background: 'transparent', border: '1px dashed #555' }}
                      onClick={() => setEditColor(c === editColor ? '' : c)} />
                  ))}
                </div>
              </div>
              <div className="card-edit-buttons">
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>保存</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>取消</button>
              </div>
            </div>
          ) : (
            <>
              <div className="card-title">{title}</div>
              {description && <div className="card-desc">{description}</div>}

              {/* 元信息行 */}
              <div className="card-meta">
                {priority && priority !== 'medium' && (
                  <span className={`badge priority-${priority}`}>{PRIORITY_LABELS[priority]}</span>
                )}
                {dueDate && (
                  <span className={`badge due-date ${isOverdue ? 'overdue' : ''}`}>
                    {isOverdue ? '⚠ ' : ''}{dueDate}
                  </span>
                )}
                {subtasks.length > 0 && (
                  <span className="badge subtask-badge" onClick={() => setShowDetails(!showDetails)}>
                    ☑ {doneCount}/{subtasks.length}
                  </span>
                )}
                {attachments.length > 0 && (
                  <span className="badge" onClick={() => setShowDetails(!showDetails)}>📎 {attachments.length}</span>
                )}
              </div>

              {/* 子任务进度条 */}
              {subtasks.length > 0 && (
                <div className="subtask-bar"><div className="subtask-bar-fill" style={{ width: `${subProgress}%` }} /></div>
              )}

              {/* 展开详情 */}
              {showDetails && (
                <div className="card-details">
                  {/* 子任务 */}
                  <div className="subtask-section">
                    {subtasks.map(s => (
                      <div key={s.id} className={`subtask-item ${s.completed ? 'done' : ''}`}
                        onMouseDown={e => e.stopPropagation()}>
                        <input type="checkbox" checked={!!s.completed} onChange={() => toggleSub(s.id)} />
                        <span>{s.title}</span>
                        <button className="subtask-del" onClick={() => removeSub(s.id)}>×</button>
                      </div>
                    ))}
                    <div className="subtask-add">
                      <input value={newSubTitle} onChange={e => setNewSubTitle(e.target.value)}
                        placeholder="+ 子任务" onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }} />
                    </div>
                  </div>

                  {/* 附件 */}
                  <div className="attach-section">
                    {attachments.map(a => (
                      <div key={a.id} className="attach-item"
                        onMouseDown={e => e.stopPropagation()}>
                        <a href={`http://localhost:3001/uploads/${a.filename}`} target="_blank" rel="noreferrer">{a.original_name}</a>
                        <button onClick={() => removeAtt(a.id)}>×</button>
                      </div>
                    ))}
                    <label className="attach-upload" onMouseDown={e => e.stopPropagation()}>
                      + 上传文件
                      <input type="file" hidden onChange={handleUpload} />
                    </label>
                  </div>
                </div>
              )}

              {/* 计时器 */}
              <div className="card-timer">
                <button className="timer-btn"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); timer.toggle(); }}
                  title={timer.running ? '暂停' : '开始'}>
                  {timer.running ? '⏸' : '▶'}
                </button>
                <span className={`timer-display ${timer.running ? 'ticking' : ''}`}>{timer.display}</span>
                <span className="timer-total">累计 {Math.floor(timer.savedTotal / 60)}分</span>
                {timer.elapsed > 0 && (
                  <button className="timer-reset"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); timer.reset(); }}>↺</button>
                )}
              </div>

              <div className="card-actions">
                <button className="card-detail"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setShowDetails(!showDetails); }}
                  title="详情">{showDetails ? '▲' : '▼'}</button>
                <button className="card-edit"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); startEdit(); }} title="编辑">✎</button>
                <button className="card-delete"
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); if (window.confirm('确认删除？')) onDelete(id); }} title="删除">✕</button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}
