import Board from './components/Board';
import Background from './components/Background';
import useTasks from './hooks/useTasks';
import './index.css';

function App() {
  const { tasks, loading, error, addTask, removeTask, handleMoveTask, editTask } = useTasks();

  return (
    <>
      {/* Background image with blur overlay */}
      <div className="bg-image">
        <img src="/background.jpg" alt="" />
      </div>

      <Background />

      <div className="app">
        <header className="app-header">
          <h1>Todo 看板</h1>
          <p className="subtitle">Kanban Board</p>
          <div className="header-divider" />
        </header>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">加载失败: {error}</div>
        ) : (
          <Board tasks={tasks} onAdd={addTask} onDelete={removeTask} onMove={handleMoveTask} onEdit={editTask} />
        )}
      </div>
    </>
  );
}

export default App;
