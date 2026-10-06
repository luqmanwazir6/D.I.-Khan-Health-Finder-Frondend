import { createBrowserRouter } from 'react-router-dom';
import RouteErrorBoundary from '@/components/common/RouteErrorBoundary';
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import MainLayout from '@/layouts/MainLayout';
import RootLayout from '@/layouts/RootLayout';
import RoleBasedRoute from '@/routes/RoleBasedRoute';

import HomePage from '@/pages/Home/HomePage';
import ServicesPage from '@/pages/Services/ServicesPage';
import ServiceDetailsPage from '@/pages/ServiceDetails/ServiceDetailsPage';
import ProvidersPage from '@/pages/Providers/ProvidersPage';
import ProviderDetailsPage from '@/pages/ProviderDetails/ProviderDetailsPage';
import SearchPage from '@/pages/Search/SearchPage';
import NewRequestPage from '@/pages/Requests/NewRequestPage';
import LoginPage from '@/pages/Auth/LoginPage';
import RegisterPage from '@/pages/Auth/RegisterPage';
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage';
import CustomerDashboardPage from '@/pages/CustomerDashboard/CustomerDashboardPage';
import ProviderDashboardPage from '@/pages/ProviderDashboard/ProviderDashboardPage';
import AdminDashboardPage from '@/pages/AdminDashboard/AdminDashboardPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: ROUTES.HOME, element: <HomePage /> },
              { path: ROUTES.SERVICES, element: <ServicesPage /> },
              { path: ROUTES.SERVICE_DETAILS, element: <ServiceDetailsPage /> },
              { path: ROUTES.PROVIDERS, element: <ProvidersPage /> },
              { path: ROUTES.PROVIDER_DETAILS, element: <ProviderDetailsPage /> },
              { path: ROUTES.SEARCH, element: <SearchPage /> },
              { path: ROUTES.NEW_REQUEST, element: <NewRequestPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          {
            errorElement: <RouteErrorBoundary />,
            children: [
              { path: ROUTES.LOGIN, element: <LoginPage /> },
              { path: ROUTES.REGISTER, element: <RegisterPage /> },
              { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
              { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
            ],
          },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            errorElement: <RouteErrorBoundary />,
            children: [
              {
                path: ROUTES.CUSTOMER_DASHBOARD,
                element: (
                  <RoleBasedRoute allowedRoles={[ROLES.CUSTOMER]}>
                    <CustomerDashboardPage />
                  </RoleBasedRoute>
                ),
              },
              {
                path: ROUTES.PROVIDER_DASHBOARD,
                element: (
                  <RoleBasedRoute allowedRoles={[ROLES.PROVIDER]}>
                    <ProviderDashboardPage />
                  </RoleBasedRoute>
                ),
              },
              {
                path: ROUTES.ADMIN_DASHBOARD,
                element: (
                  <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
                    <AdminDashboardPage />
                  </RoleBasedRoute>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);
