import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import boardService from '../services/boardService';
import { User, Mail, Shield, FolderGit, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [assignedBoards, setAssignedBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileBoards = async () => {
      try {
        const boardsData = await boardService.getBoards();
        setAssignedBoards(boardsData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch assigned boards.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileBoards();
  }, []);

  if (!user) return null;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontFamily: 'Outfit, sans-serif' }}>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage your credentials and view your workspace assignments.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="glass-panel profile-card" style={{ width: '100%', margin: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                marginBottom: '1rem'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600 }}>{user.name}</h2>
            <span className={`role-badge role-${user.role}`} style={{ marginTop: '0.5rem' }}>
              {user.role}
            </span>
          </div>

          <div className="profile-info">
            <div className="profile-field">
              <span className="profile-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} />
                <span>Email Address</span>
              </span>
              <span className="profile-value">{user.email}</span>
            </div>

            <div className="profile-field">
              <span className="profile-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} />
                <span>Account Role</span>
              </span>
              <span className="profile-value">{user.role}</span>
            </div>

            <div className="profile-field" style={{ border: 'none', paddingBottom: '0' }}>
              <span className="profile-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} />
                <span>Account ID</span>
              </span>
              <span className="profile-value" style={{ color: 'var(--text-secondary)' }}>#{user.id}</span>
            </div>
          </div>
        </div>

        {/* Assigned Boards list */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderGit size={20} style={{ color: 'var(--secondary)' }} />
            <span>Assigned Projects</span>
          </h3>

          {error && (
            <div className="alert alert-danger" style={{ padding: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading project assignments...</p>
          ) : assignedBoards.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              You are not currently assigned to any boards.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assignedBoards.map(board => (
                <div
                  key={board.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 500, display: 'block', fontSize: '0.95rem' }}>{board.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{board.description || 'No description'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    {board.taskCount} tasks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
