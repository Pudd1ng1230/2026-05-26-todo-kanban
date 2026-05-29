import Column from './Column';

const columns = [
  { status: 'todo' },
  { status: 'in-progress' },
  { status: 'done' },
];

export default function Board({ tasks, onAdd }) {
  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="board">
      {columns.map(({ status }) => (
        <Column
          key={status}
          status={status}
          tasks={getTasksByStatus(status)}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
