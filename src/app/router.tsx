import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from '@/app/protected-route';
import { PublicOnlyRoute } from '@/app/public-only-route';
import { RouteErrorBoundary } from '@/app/route-error-boundary';
import { NotFoundPage } from '@/app/not-found-page';

const LoginPage = lazy(() =>
  import('@/features/auth/pages/login-page').then((m) => ({
    default: m.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/register-page').then((m) => ({
    default: m.RegisterPage,
  })),
);
const WorkspaceListPage = lazy(() =>
  import('@/features/workspaces/pages/workspace-list-page').then((m) => ({
    default: m.WorkspaceListPage,
  })),
);
const WorkspaceSettingsPage = lazy(() =>
  import('@/features/workspaces/pages/workspace-settings-page').then((m) => ({
    default: m.WorkspaceSettingsPage,
  })),
);
const WorkspaceDetailPage = lazy(() =>
  import('@/features/projects/pages/workspace-detail-page').then((m) => ({
    default: m.WorkspaceDetailPage,
  })),
);
const KanbanPage = lazy(() =>
  import('@/features/tasks/pages/kanban-page').then((m) => ({
    default: m.KanbanPage,
  })),
);

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <WorkspaceListPage /> },
          {
            path: '/workspaces/:workspaceId',
            element: <WorkspaceDetailPage />,
          },
          {
            path: '/workspaces/:workspaceId/settings',
            element: <WorkspaceSettingsPage />,
          },
          {
            path: '/workspaces/:workspaceId/projects/:projectId',
            element: <KanbanPage />,
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
