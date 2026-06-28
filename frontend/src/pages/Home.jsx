import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Kanban, 
  Users, 
  Zap, 
  Shield, 
  UserCheck, 
  ArrowRight, 
  Layout, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      {/* Background Blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">Real-Time Task Collaboration</span>
          <h1 className="hero-title">
            Streamline projects. <br />
            Collaborate in <span>real-time</span>.
          </h1>
          <p className="hero-subtitle">
            A premium multi-user Kanban system built to help teams organize, track, 
            and complete tasks dynamically. Enjoy instant sync, custom roles, and visual simplicity.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn-hero-primary">
                <span>Go to Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero-primary">
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-hero-secondary">
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mock Board Preview */}
        <div className="mock-board-preview glass-panel">
          <div className="mock-board-header">
            <span className="mock-board-title">Sprint Board</span>
            <span className="mock-board-badge">Active Sprint</span>
          </div>

          <div className="mock-columns">
            {/* Column 1: Todo */}
            <div className="mock-column">
              <div className="mock-column-header">
                <span className="mock-column-dot todo"></span>
                <span>TO DO</span>
              </div>
              <div className="mock-task">
                <div className="mock-task-title">Integrate STOMP WebSockets</div>
                <div className="mock-task-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#38bdf8' }}>
                    <Zap size={12} />
                    <span>MEDIUM</span>
                  </div>
                  <div className="mock-avatar">AM</div>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="mock-column">
              <div className="mock-column-header">
                <span className="mock-column-dot progress"></span>
                <span>IN PROGRESS</span>
              </div>
              <div className="mock-task">
                <div className="mock-task-title">Design Glassmorphic UI</div>
                <div className="mock-task-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                    <Zap size={12} />
                    <span>HIGH</span>
                  </div>
                  <div className="mock-avatar">JD</div>
                </div>
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="mock-column">
              <div className="mock-column-header">
                <span className="mock-column-dot done"></span>
                <span>DONE</span>
              </div>
              <div className="mock-task" style={{ opacity: 0.7 }}>
                <div className="mock-task-title" style={{ textDecoration: 'line-through' }}>Setup Spring Boot Server</div>
                <div className="mock-task-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981' }}>
                    <Zap size={12} />
                    <span>LOW</span>
                  </div>
                  <div className="mock-avatar">SYS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="features-title">Everything you need to stay synchronized</h2>
          <p className="features-subtitle">Powerful features designed to optimize your task management flow.</p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3 className="feature-card-title">Real-Time Sync</h3>
            <p className="feature-card-desc">
              Powered by WebSockets to ensure your team sees task updates and moves the second they happen.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Layout size={24} />
            </div>
            <h3 className="feature-card-title">Kanban Boards</h3>
            <p className="feature-card-desc">
              Organize tasks seamlessly with drag-and-drop columns, priorities, and description details.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <Shield size={24} />
            </div>
            <h3 className="feature-card-title">Role-Based Access</h3>
            <p className="feature-card-desc">
              Control permissions with Member and Admin roles, keeping board configurations safe and organized.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper">
              <UserCheck size={24} />
            </div>
            <h3 className="feature-card-title">Profile Profiles</h3>
            <p className="feature-card-desc">
              Track board participation, task metrics, and manage account details in a personalized page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
