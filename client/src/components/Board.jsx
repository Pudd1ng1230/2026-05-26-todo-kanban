import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

const columns = [
  { status: 'todo' },
  { status: 'in-progress' },
  { status: 'done' },
];

export default function Board({ tasks, onAdd, onDelete, onMove }) {
  const getTasksByStatus = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const taskId = Number(draggableId);
    const newStatus = destination.droppableId;
    onMove(taskId, newStatus, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="board">
        {columns.map(({ status }) => (
          <Column
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onAdd={onAdd}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
