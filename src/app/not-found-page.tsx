import { Link } from 'react-router';
import { CompassIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <EmptyState
        icon={CompassIcon}
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
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
