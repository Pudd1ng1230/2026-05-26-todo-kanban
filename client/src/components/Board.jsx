/**
 * Board — 看板主体
 *
 * 职责：
 * 1. 提供 DragDropContext 包裹整个拖拽区域
 * 2. 按 status 分组任务，透传给三个 Column
 * 3. 处理 onDragEnd：解析拖拽结果 → 调用 onMove(taskId, newStatus, newPosition)
 */

import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

// 三列配置：列标识 = 任务 status 字段的值
const columns = [
  { status: 'todo' },
  { status: 'in-progress' },
  { status: 'done' },
];

export default function Board({ tasks, onAdd, onDelete, onMove, onEdit, onPin }) {
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
            onEdit={onEdit}
            onPin={onPin}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
