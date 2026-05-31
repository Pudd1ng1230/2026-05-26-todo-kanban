/**
 * Column — 单列容器
 *
 * 职责：
 * 1. 渲染列标题（dot + 名称 + 计数）
 * 2. 作为 Droppable 区域接收拖入的卡片
 * 3. 渲染该列的所有 Card + 底部 AddCardForm
 *
 * Props:
 * @param {string} status — 列标识 todo / in-progress / done
 * @param {Array} tasks — 该列的任务列表
 * @param {Function} onAdd — 新增卡片回调
 * @param {Function} onDelete — 删除卡片回调
 * @param {Function} onEdit — 编辑卡片回调
 * @param {Function} onPin — 置顶切换回调
 */

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
