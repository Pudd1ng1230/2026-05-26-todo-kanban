import { useState } from 'react';
import Board from './components/Board';
import BoardSelector from './components/BoardSelector';
import SearchBar from './components/SearchBar';
import RecycleBin from './components/RecycleBin';
import Background from './components/Background';
import useBoards from './hooks/useBoards';
import useTasks, { useRecycleBin } from './hooks/useTasks';
import './index.css';

function App() {
  const { boards, activeId, setActiveId, addBoard, removeBoard } = useBoards();
  const { tasks, loading, error, addTask, removeTask, editTask, handleMoveTask, search, reload } = useTasks(activeId);
  const recycle = useRecycleBin(activeId);
  const [showRecycle, setShowRecycle] = useState(false);

  return (
    <>
      <div className="bg-image"><img src="/background.jpg" alt="" /></div>
      <Background />

      <div className="app">
        <header className="app-header">
          <h1>Todo 看板</h1>
          <p className="subtitle">Kanban Board</p>
          <div className="header-divider" />
        </header>

        <div className="toolbar">
          <BoardSelector
            boards={boards}
            activeId={activeId}
            onSelect={setActiveId}
            onAdd={addBoard}
            onDelete={removeBoard}
          />
          <div className="toolbar-right">
            <SearchBar onSearch={search} />
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowRecycle(true); recycle.reload(); }}>
              🗑️
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">加载失败: {error}</div>
        ) : (
          <Board tasks={tasks} onAdd={addTask} onDelete={removeTask} onMove={handleMoveTask} onEdit={editTask} />
        )}

        {showRecycle && (
          <RecycleBin
            tasks={recycle.tasks}
            boards={boards}
            loading={recycle.loading}
            onRestore={async (id) => { await recycle.restore(id); reload(); }}
            onPermanentDelete={(id) => { recycle.permanentDelete(id); }}
            onClose={() => setShowRecycle(false)}
          />
        )}
      </div>
    </>
  );
}

export default App;
