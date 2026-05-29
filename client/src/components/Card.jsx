import { Draggable } from '@hello-pangea/dnd';

export default function Card({ id, index, title, description, status, onDelete }) {
  return (
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card status-${status} ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="card-title">{title}</div>
          {description && <div className="card-desc">{description}</div>}
          <button
            className="card-delete"
            onClick={() => onDelete(id)}
            title="删除"
          >
            ✕
          </button>
        </div>
      )}
    </Draggable>
  );
}
