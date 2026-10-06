import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/constants/roles';
import './DashboardSidebar.css';

export default function DashboardSidebar({
  items = [],
  activeTab,
  onSelectTab,
  className = '',
}) {
  const { user, role } = useAuth();

  return (
    <aside className={`dashboard-sidebar ${className}`} aria-label="Dashboard navigation">
      {/* User summary card */}
      <div className="sidebar-profile-card">
        <FaUserCircle className="sidebar-avatar-icon" aria-hidden="true" />
        <div className="sidebar-user-details">
          <strong className="sidebar-user-name">{user?.name}</strong>
          <span className={`sidebar-role-badge role-${role}`}>
            {ROLE_LABELS[role] || role}
          </span>
          {user?.area && (
            <small className="sidebar-user-city">{user.area}, D.I. Khan</small>
          )}
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
              >
                {item.icon && <span className="sidebar-btn-icon" aria-hidden="true">{item.icon}</span>}
                <span className="sidebar-btn-label">{item.label}</span>
                {item.count !== undefined && item.count !== null && (
                  <span className="sidebar-badge">{item.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
