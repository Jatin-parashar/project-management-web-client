import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectIsBootstrapping,
} from '@/features/auth/auth-slice';
import { FullPageSpinner } from '@/components/shared/full-page-spinner';

// Guards routes that only make sense when logged OUT (login, register) — the
// mirror image of ProtectedRoute. Without this, an already-authenticated
// user who navigates to /login directly just sees the login form again
// instead of being sent to the app.
export function PublicOnlyRoute() {
  const isBootstrapping = useAppSelector(selectIsBootstrapping);
  const user = useAppSelector(selectCurrentUser);

  if (isBootstrapping) return <FullPageSpinner />;
  if (user) return <Navigate to="/" replace />;

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Outlet />
    </Suspense>
  );
}
