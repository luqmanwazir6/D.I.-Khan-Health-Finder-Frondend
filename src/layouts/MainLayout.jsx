import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Loader from '@/components/common/Loader';
import './Layouts.css';

/** Public site layout with full Navbar and Footer */
export default function MainLayout() {
  return (
    <div className="layout-main">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="layout-content" tabIndex={-1}>
        <Suspense fallback={<Loader fullPage label="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
