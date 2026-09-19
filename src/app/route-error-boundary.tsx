import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

export function RouteErrorBoundary() {
  const error = useRouteError();

  const description = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'An unexpected error occurred while loading this page.';

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <EmptyState
        icon={TriangleAlertIcon}
        title="Something went wrong"
        description={description}
        action={
          <Button
            nativeButton={false}
            render={<Link to="/">Back to workspaces</Link>}
          />
        }
      />
    </div>
  );
}
