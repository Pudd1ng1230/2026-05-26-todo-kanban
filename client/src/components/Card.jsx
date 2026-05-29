import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import useTimer from '../hooks/useTimer';

export default function Card({ id, index, title, description, status, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDesc, setEditDesc] = useState(description);
  const timer = useTimer();

  const startEdit = () => {
    setEditTitle(title);
    setEditDesc(description);
    setEditing(true);
  };

  const saveEdit = () => {
    if (editTitle.trim()) {
      onEdit(id, editTitle.trim(), editDesc.trim());
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  return (
    <Draggable draggableId={String(id)} index={index} isDragDisabled={editing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(editing ? {} : provided.dragHandleProps)}
          className={`card status-${status} ${snapshot.isDragging ? 'dragging' : ''}`}
          style={provided.draggableProps.style}
        >
          {editing ? (
            <div className="card-edit-form">
              <input
                className="card-edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="标题"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveEdit();
                  }
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
              <textarea
                className="card-edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="描述（可选）"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
              <div className="card-edit-buttons">
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>保存</button>
                <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>取消</button>
              </div>
            </div>
          ) : (
            <>
              <div className="card-title">{title}</div>
              {description && <div className="card-desc">{description}</div>}

              {/* 计时器 */}
              <div className="card-timer">
                <button
                  className="timer-btn"
                  onClick={(e) => { e.stopPropagation(); timer.toggle(); }}
                  title={timer.running ? '暂停' : '开始'}
                >
                  {timer.running ? '⏸' : '▶'}
                </button>
                <span className={`timer-display ${timer.running ? 'ticking' : ''}`}>
                  {timer.display}
                </span>
                {timer.elapsed > 0 && (
                  <button
                    className="timer-reset"
                    onClick={(e) => { e.stopPropagation(); timer.reset(); }}
                    title="重置"
                  >
                    ↺
                  </button>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="card-edit"
                  onClick={(e) => { e.stopPropagation(); startEdit(); }}
                  title="编辑"
                >
                  ✎
                </button>
                <button
                  className="card-delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                  title="删除"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}
