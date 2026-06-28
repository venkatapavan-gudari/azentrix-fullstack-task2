import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Kanban, LayoutDashboard, User, ShieldAlert, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate(user ? '/dashboard' : '/')}>
        <Kanban size={24} className="primary-icon" style={{ stroke: '#6366f1' }} />
        <span>Mini Trello</span>
      </div>
      
      {user ? (
        <div className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <LayoutDashboard size={18} />
            <span>Boards</span>
          </NavLink>
          
          {isAdmin() && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <ShieldAlert size={18} />
              <span>Admin Panel</span>
            </NavLink>
          )}
          
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
          
          <button className="btn-logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="nav-links">
          {!isLoginPage && (
            <NavLink to="/login" className="nav-btn-login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogIn size={16} />
              <span>Sign In</span>
            </NavLink>
          )}
          {!isRegisterPage && (
            <NavLink to="/register" className="nav-btn-register" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserPlus size={16} />
              <span>Register</span>
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
