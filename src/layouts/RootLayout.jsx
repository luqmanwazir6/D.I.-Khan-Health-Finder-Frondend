import { Outlet, ScrollRestoration } from 'react-router-dom';

/**
 * Top-level route element shared by every layout. Home for app-wide,
 * router-aware concerns (scroll restoration now; toasts etc. later).
 */
export default function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}
