import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import AddCardForm from './AddCardForm';

const statusLabels = { todo: '待办', 'in-progress': '进行中', done: '已完成' };

export default function Column({ status, tasks, onAdd, onDelete, onEdit, onPin }) {
  return (
    <div className="column">
      <div className="column-header">
        <span className="column-dot" />
        <h2>{statusLabels[status]}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {tasks.length === 0 ? (
              <div className="column-empty">暂无任务</div>
            ) : (
              tasks.map((task, index) => (
                <Card
                  key={task.id}
                  id={task.id}
                  index={index}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  priority={task.priority}
                  dueDate={task.due_date}
                  color={task.color}
                  pinned={task.pinned}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onPin={onPin}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <AddCardForm onAdd={(title, desc, priority, dueDate, color) => onAdd(status, title, desc, priority, dueDate, color)} />
    </div>
  );
}
