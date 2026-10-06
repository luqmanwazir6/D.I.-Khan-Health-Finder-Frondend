import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Loader from '@/components/common/Loader';
import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import './Layouts.css';

/**
 * Shell for customer/provider/admin dashboards.
 * Role-specific sidebar navigation is added in Phases 7–9; route protection
 * (ProtectedRoute / RoleBasedRoute) is added in Phase 6.
 */
export default function DashboardLayout() {
  return (
    <div className="layout-dashboard">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link to={ROUTES.HOME} className="shell-brand">
            {APP_CONFIG.appName}
          </Link>
        </div>
      </header>

      <main id="main-content" className="dashboard-content" tabIndex={-1}>
        <Suspense fallback={<Loader fullPage label="Loading dashboard…" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
