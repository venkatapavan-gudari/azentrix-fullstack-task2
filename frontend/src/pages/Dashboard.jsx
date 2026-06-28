import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import boardService from '../services/boardService';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, ClipboardList, FolderKanban, PlusCircle, X, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Board Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch boards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!newBoardName.trim()) {
      setModalError('Board name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await boardService.createBoard({
        name: newBoardName,
        description: newBoardDesc
      });
      // Clear and close
      setNewBoardName('');
      setNewBoardDesc('');
      setIsModalOpen(false);
      fetchBoards(); // refresh
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to create board.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontFamily: 'Outfit, sans-serif' }}>Project Boards</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isAdmin() ? 'Manage and assign organization boards' : 'View your assigned project boards'}
          </p>
        </div>
        
        {isAdmin() && (
          <button className="btn-create" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Create Board</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: '600px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem 0' }}>
          <div style={{ color: 'var(--primary)' }}>Loading Boards...</div>
        </div>
      ) : boards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FolderKanban size={48} style={{ stroke: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Boards Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {isAdmin() ? 'Create a project board to get started.' : 'You have not been assigned to any boards yet.'}
          </p>
        </div>
      ) : (
        <div className="board-grid">
          {boards.map((board) => (
            <div
              key={board.id}
              className="board-card glass-panel"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div>
                <h3 className="board-name">{board.name}</h3>
                <p className="board-desc">{board.description || 'No description provided.'}</p>
              </div>

              <div className="board-footer">
                <span>By {board.createdBy?.name || 'Admin'}</span>
                
                <div className="board-stats">
                  <div className="board-stat" title="Tasks count">
                    <ClipboardList size={14} />
                    <span>{board.taskCount}</span>
                  </div>
                  <div className="board-stat" title="Members assigned">
                    <Users size={14} />
                    <span>{board.membersCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontFamily: 'Outfit, sans-serif' }}>New Project Board</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="alert alert-danger">
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label className="form-label">Board Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Website Overhaul"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Summarize the board's scope..."
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={submitting}>
                  <PlusCircle size={18} />
                  <span>{submitting ? 'Creating...' : 'Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
