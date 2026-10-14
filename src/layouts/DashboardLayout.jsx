import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/common/Loader';
import './Layouts.css';

/**
 * Complete production shell for Customer, Provider, and Admin dashboards
 * with responsive Navbar, active role indicators, and full Footer.
 */
export default function DashboardLayout() {
  return (
    <div className="layout-dashboard">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="dashboard-content" tabIndex={-1}>
        <Suspense fallback={<Loader fullPage label="Loading dashboard…" />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
