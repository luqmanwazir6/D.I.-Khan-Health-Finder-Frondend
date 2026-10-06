import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Loader from '@/components/common/Loader';
import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import './Layouts.css';

/** Focused layout for login/registration flows — no distracting navigation. */
export default function AuthLayout() {
  return (
    <div className="layout-auth">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="auth-layout-header">
        <Link to={ROUTES.HOME} className="shell-brand">
          {APP_CONFIG.appName}
        </Link>
      </header>

      <main id="main-content" className="auth-content" tabIndex={-1}>
        <div className="auth-card">
          <Suspense fallback={<Loader label="Loading…" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
