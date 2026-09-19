import { useEffect } from 'react';
import { useRefreshMutation } from '@/features/auth/auth-api';

interface SessionBootstrapProps {
  children: React.ReactNode;
}

// Fires the silent /auth/refresh call once on app start, trading the
// httpOnly refresh cookie for a fresh access token. This does NOT block
// rendering — a page like /login doesn't need to wait on it at all. Route
// guards (ProtectedRoute, PublicOnlyRoute) read `isBootstrapping` from the
// auth slice themselves and decide individually whether they need to wait.
export function SessionBootstrap({ children }: SessionBootstrapProps) {
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return children;
}
