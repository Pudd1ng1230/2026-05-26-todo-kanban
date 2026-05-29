import Card from './Card';
import AddCardForm from './AddCardForm';

const statusLabels = {
  todo: '待办',
  'in-progress': '进行中',
  done: '已完成',
};

export default function Column({ status, tasks, onAdd }) {
  return (
    <div className="column">
      <div className="column-header">
        <span className="column-dot" />
        <h2>{statusLabels[status]}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-list">
        {tasks.length === 0 ? (
          <div className="column-empty">暂无任务</div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} title={task.title} description={task.description} status={task.status} />
          ))
        )}
      </div>
      <AddCardForm onAdd={(title) => onAdd(status, title)} />
    </div>
  );
}
