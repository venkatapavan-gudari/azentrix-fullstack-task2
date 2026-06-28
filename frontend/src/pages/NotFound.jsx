import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="auth-wrapper" style={{ minHeight: 'calc(100vh - 70px)' }}>
      <div className="auth-card glass-panel" style={{ textAlign: 'center', padding: '3rem 2.5rem' }}>
        <div style={{ display: 'inline-flex', padding: '1.25rem', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)', marginBottom: '1.5rem' }}>
          <Compass size={48} className="spin-animation" />
        </div>
        
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #f43f5e, #fb7185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          404
        </h1>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem', marginBottom: '1rem' }}>
          Page Not Found
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          The board or dashboard resource you are looking for does not exist, or has been moved.
        </p>

        <button className="btn-primary" onClick={() => navigate(user ? '/dashboard' : '/')}>
          <Home size={18} />
          <span>{user ? 'Back to Dashboard' : 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
