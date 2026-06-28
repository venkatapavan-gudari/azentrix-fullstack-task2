import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Key, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9\s]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasSpecialChar) {
      setError('Password must be at least 8 characters long, and contain at least one uppercase letter and one special symbol.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register. Email might be already in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Get started with your collaborative Kanban board</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: password.length > 0 ? '1.25rem' : '2rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="At least 8 chars, 1 uppercase, 1 special symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>

            {password.length > 0 && (
              <div className="password-requirements">
                <div className={`requirement-item ${password.length >= 8 ? 'valid' : 'invalid'}`}>
                  {password.length >= 8 ? (
                    <CheckCircle size={14} />
                  ) : (
                    <div className="requirement-bullet" />
                  )}
                  <span>At least 8 characters</span>
                </div>
                <div className={`requirement-item ${/[A-Z]/.test(password) ? 'valid' : 'invalid'}`}>
                  {/[A-Z]/.test(password) ? (
                    <CheckCircle size={14} />
                  ) : (
                    <div className="requirement-bullet" />
                  )}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`requirement-item ${/[^A-Za-z0-9\s]/.test(password) ? 'valid' : 'invalid'}`}>
                  {/[^A-Za-z0-9\s]/.test(password) ? (
                    <CheckCircle size={14} />
                  ) : (
                    <div className="requirement-bullet" />
                  )}
                  <span>At least one special symbol (e.g. @, #, $, %)</span>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
