import { Link } from 'react-router';
import { FolderKanbanIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { RoleBadge } from '@/features/workspaces/components/role-badge';
import { CreateWorkspaceDialog } from '@/features/workspaces/components/create-workspace-dialog';
import { useListWorkspacesQuery } from '@/features/workspaces/workspaces-api';

export function WorkspaceListPage() {
  const { data: workspaces, isLoading } = useListWorkspacesQuery();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <PageHeader
          title="Workspaces"
          description="Pick a workspace to see its projects, or create a new one."
          actions={<CreateWorkspaceDialog />}
        />

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && workspaces?.length === 0 && (
          <EmptyState
            icon={FolderKanbanIcon}
            title="No workspaces yet"
            description="Create a workspace to start organizing projects and inviting your team."
            action={<CreateWorkspaceDialog />}
          />
        )}

        {!isLoading && workspaces && workspaces.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link key={workspace.id} to={`/workspaces/${workspace.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {workspace.name}
                      </CardTitle>
                      <RoleBadge role={workspace.myRole} />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
