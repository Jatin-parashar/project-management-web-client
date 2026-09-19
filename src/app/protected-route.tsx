import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectIsBootstrapping,
} from '@/features/auth/auth-slice';
import { FullPageSpinner } from '@/components/shared/full-page-spinner';

export function ProtectedRoute() {
  const isBootstrapping = useAppSelector(selectIsBootstrapping);
  const user = useAppSelector(selectCurrentUser);

  if (isBootstrapping) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Outlet />
    </Suspense>
  );
}
