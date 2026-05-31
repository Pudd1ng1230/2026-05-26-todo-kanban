/**
 * RecycleBin — 回收站弹窗
 *
 * 以模态浮层展示所有软删除的任务。
 * 支持恢复（清除 deleted_at）和彻底删除（不可恢复）。
 * 点击遮罩层关闭。
 *
 * @param {Array} tasks — 回收站中的任务列表
 * @param {Array} boards — 板块列表（用于显示所属板块名）
 * @param {boolean} loading — 加载状态
 * @param {Function} onRestore(id) — 恢复回调
 * @param {Function} onPermanentDelete(id) — 彻底删除回调
 * @param {Function} onClose — 关闭弹窗回调
 */

export default function RecycleBin({ tasks, boards, loading, onRestore, onPermanentDelete, onClose }) {
  const getBoardName = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    return board ? board.name : '未知看板';
  };

  return (
    <div className="recycle-bin-overlay" onClick={onClose}>
      <div className="recycle-bin" onClick={e => e.stopPropagation()}>
        <div className="recycle-bin-header">
          <h2>🗑️ 回收站</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>关闭</button>
        </div>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="column-empty">回收站是空的</div>
        ) : (
          <div className="recycle-list">
            {tasks.map(t => (
              <div key={t.id} className="recycle-item">
                <div className="recycle-info">
                  <span className="recycle-title">{t.title}</span>
                  <span className="recycle-board">{getBoardName(t.board_id)}</span>
                  <span className="recycle-date">{t.deleted_at?.slice(0, 16)}</span>
                </div>
                <div className="recycle-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => onRestore(t.id)}>恢复</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onPermanentDelete(t.id)}>彻底删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
