import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/common/Loader';
import './Layouts.css';

/**
 * Layout for login, registration, and password recovery flows
 * with full Navbar, unified brand headers, and professional Footer.
 */
export default function AuthLayout() {
  return (
    <div className="layout-auth">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="auth-content" tabIndex={-1}>
        <div className="auth-card">
          <Suspense fallback={<Loader label="Loading…" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
