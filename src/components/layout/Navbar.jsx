import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaBriefcase,
  FaUserShield,
  FaUserCheck,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/constants/config';
import { ROUTES, getDashboardPath } from '@/constants/routes';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import Button from '@/components/common/Button';
import './Navbar.css';

export default function Navbar() {
  const { user, role, isAuthenticated, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  const dashboardPath = getDashboardPath(role);

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand */}
        <div className="navbar-brand-group">
          <Link to={ROUTES.HOME} className="navbar-brand" aria-label="D.I. Khan Service Finder Home">
            <span className="brand-icon-wrap" aria-hidden="true">
              <FaMapMarkerAlt />
            </span>
            <span className="brand-text">
              <strong>D.I. Khan</strong>
              <small>Service Finder</small>
            </span>
          </Link>
          <span className="city-pill">
            <FaMapMarkerAlt aria-hidden="true" /> Dera Ismail Khan
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-nav desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links" role="list">
            <li>
              <NavLink to={ROUTES.HOME} end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to={ROUTES.SERVICES} className={({ isActive }) => (isActive ? 'active' : '')}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to={ROUTES.PROVIDERS} className={({ isActive }) => (isActive ? 'active' : '')}>
                Find Professionals
              </NavLink>
            </li>
            <li>
              <a href="#how-it-works">How It Works</a>
            </li>
          </ul>
        </nav>

        {/* Right Action / Auth Controls */}
        <div className="navbar-actions desktop-actions">
          <Link
            to={ROUTES.SEARCH}
            className="navbar-search-btn"
            title="Search services"
            aria-label="Search services"
          >
            <FaSearch aria-hidden="true" />
          </Link>

          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <FaUserCircle className="user-avatar-icon" aria-hidden="true" />
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <span className={`user-role-tag role-${role}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu" role="menu">
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-name">{user?.name}</p>
                    <p className="user-dropdown-email">{user?.email || user?.phone}</p>
                  </div>

                  <Link to={dashboardPath} className="dropdown-item" role="menuitem">
                    <FaBriefcase aria-hidden="true" /> Dashboard
                  </Link>

                  {role === ROLES.CUSTOMER && (
                    <Link to={ROUTES.NEW_REQUEST} className="dropdown-item" role="menuitem">
                      Request a Service
                    </Link>
                  )}

                  {/* Quick role switcher for testing convenience */}
                  <div className="dropdown-role-switch">
                    <span className="role-switch-title">Switch Mode (Demo):</span>
                    <div className="role-switch-buttons">
                      <button
                        type="button"
                        className={`role-chip ${role === ROLES.CUSTOMER ? 'active' : ''}`}
                        onClick={() => switchRole(ROLES.CUSTOMER)}
                      >
                        <FaUserCheck aria-hidden="true" /> Customer
                      </button>
                      <button
                        type="button"
                        className={`role-chip ${role === ROLES.PROVIDER ? 'active' : ''}`}
                        onClick={() => switchRole(ROLES.PROVIDER)}
                      >
                        <FaBriefcase aria-hidden="true" /> Pro
                      </button>
                      <button
                        type="button"
                        className={`role-chip ${role === ROLES.ADMIN ? 'active' : ''}`}
                        onClick={() => switchRole(ROLES.ADMIN)}
                      >
                        <FaUserShield aria-hidden="true" /> Admin
                      </button>
                    </div>
                  </div>

                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <FaSignOutAlt aria-hidden="true" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to={ROUTES.LOGIN} className="btn-login-link">
                Log in
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                Join / Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
        >
          {mobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <nav className="mobile-nav-links">
            <Link to={ROUTES.SEARCH} className="mobile-search-bar">
              <FaSearch aria-hidden="true" />
              <span>Search services in D.I. Khan…</span>
            </Link>

            <NavLink to={ROUTES.HOME} end className="mobile-link">
              Home
            </NavLink>
            <NavLink to={ROUTES.SERVICES} className="mobile-link">
              Services & Categories
            </NavLink>
            <NavLink to={ROUTES.PROVIDERS} className="mobile-link">
              Find Professionals
            </NavLink>
            <a href="#how-it-works" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>

            {isAuthenticated ? (
              <div className="mobile-auth-section">
                <div className="mobile-user-card">
                  <FaUserCircle className="mobile-user-icon" aria-hidden="true" />
                  <div>
                    <strong>{user?.name}</strong>
                    <span className="mobile-role-label">{ROLE_LABELS[role]}</span>
                  </div>
                </div>
                <Link to={dashboardPath} className="mobile-link mobile-link-accent">
                  Go to Dashboard
                </Link>
                {role === ROLES.CUSTOMER && (
                  <Link to={ROUTES.NEW_REQUEST} className="mobile-link">
                    + Post Service Request
                  </Link>
                )}
                <button type="button" className="mobile-logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt aria-hidden="true" /> Log out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Button fullWidth variant="primary" onClick={() => navigate(ROUTES.REGISTER)}>
                  Join as Professional or Customer
                </Button>
                <Button fullWidth variant="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
                  Log in
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
