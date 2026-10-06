import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, getDashboardPath } from '@/constants/routes';
import Loader from '@/components/common/Loader';

/**
 * Route guard checking specific role access.
 * If not authenticated, redirects to /login.
 * If authenticated with wrong role, redirects to the user's appropriate dashboard.
 */
export default function RoleBasedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullPage label="Verifying access permissions…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to the dashboard appropriate for their role
    const fallbackPath = getDashboardPath(user?.role);
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
