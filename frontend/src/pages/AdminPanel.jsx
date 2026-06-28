import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import boardService from '../services/boardService';
import { Trash2, Users, Sliders, X, Check, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Member Assignment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await userService.getUsers();
      setUsers(usersData);
      
      const boardsData = await boardService.getBoards();
      setBoards(boardsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (name.includes('admin@trello.com') || name === 'System Admin') {
      alert("Cannot delete the root administrator account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await userService.deleteUser(id);
      setSuccess(`User "${name}" deleted successfully.`);
      loadData(); // reload
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Open Membership Assignment Modal
  const openAssignmentModal = async (board) => {
    setActiveBoard(board);
    setModalError('');
    setSelectedUserIds([]);
    try {
      // Get current members of this board
      const activeMembers = await boardService.getBoardMembers(board.id);
      setSelectedUserIds(activeMembers.map(m => m.id));
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve current board members.');
    }
  };

  const handleToggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleSaveMembers = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSubmitting(true);
    try {
      await boardService.updateBoardMembers(activeBoard.id, selectedUserIds);
      setSuccess(`Updated members for board "${activeBoard.name}"`);
      setIsModalOpen(false);
      loadData(); // refresh counts
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to update board members.');
    } finally {
      setModalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ color: 'var(--primary)' }}>Loading Administration Console...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={28} style={{ color: 'var(--primary)' }} />
            <span>Organization Admin Panel</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage organization accounts, monitor active project boards, and assign collaborators.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: '600px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ maxWidth: '600px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Users Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: 'var(--secondary)' }} />
            <span>Manage Users</span>
          </h2>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-icon delete"
                      title="Delete User"
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      disabled={u.email === 'admin@trello.com'}
                      style={{ opacity: u.email === 'admin@trello.com' ? 0.3 : 1 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boards Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} style={{ color: 'var(--primary)' }} />
            <span>Board Assignments</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {boards.map(board => (
              <div
                key={board.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div>
                  <h4 style={{ fontWeight: 600 }}>{board.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {board.membersCount} Members assigned
                  </span>
                </div>
                
                <button
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => openAssignmentModal(board)}
                >
                  <Users size={14} />
                  <span>Assign</span>
                </button>
              </div>
            ))}
            
            {boards.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                No active boards. Create one on the dashboard first.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Member Assignment Modal */}
      {isModalOpen && activeBoard && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Assign Members</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Select users to assign to <strong>{activeBoard.name}</strong>
                </p>
              </div>
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

            <form onSubmit={handleSaveMembers}>
              <div className="user-select-list">
                {users.map(u => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      className={`user-select-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleUserSelection(u.id)}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                      </div>
                      
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: isChecked ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)',
                          background: isChecked ? 'var(--primary)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isChecked && <Check size={14} style={{ stroke: '#fff' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={modalSubmitting}>
                  <CheckCircle size={18} />
                  <span>{modalSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
