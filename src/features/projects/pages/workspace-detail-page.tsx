import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import {
  SettingsIcon,
  FolderKanbanIcon,
  ArchiveIcon,
  UsersIcon,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { useGetWorkspaceQuery } from '@/features/workspaces/workspaces-api';
import { useListProjectsQuery } from '@/features/projects/projects-api';
import { ProjectCard } from '@/features/projects/components/project-card';
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog';
import { ActivityFeed } from '@/features/activity-log/components/activity-feed';
import type { Role } from '@/types/api';

const CAN_CREATE_PROJECT: Role[] = ['OWNER', 'ADMIN', 'MANAGER'];
const CAN_ARCHIVE_PROJECT: Role[] = ['OWNER', 'ADMIN'];

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: workspace, isLoading: isLoadingWorkspace } =
    useGetWorkspaceQuery(workspaceId!);
  const { data: projects, isLoading: isLoadingProjects } = useListProjectsQuery(
    {
      workspaceId: workspaceId!,
      includeArchived: true,
    },
  );

  const myRole = workspace?.members.find(
    (m) => m.userId === currentUser?.userId,
  )?.role;
  const canCreate = !!myRole && CAN_CREATE_PROJECT.includes(myRole);
  const canArchive = !!myRole && CAN_ARCHIVE_PROJECT.includes(myRole);
  const membersById = useMemo(
    () => new Map(workspace?.members.map((m) => [m.userId, m.user]) ?? []),
    [workspace],
  );

  const isLoading = isLoadingWorkspace || isLoadingProjects;
  const activeProjects = projects?.filter((p) => !p.archivedAt) ?? [];
  const archivedProjects = projects?.filter((p) => p.archivedAt) ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <PageHeader
          title={
            isLoadingWorkspace ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              workspace?.name
            )
          }
          actions={
            <>
              {workspaceId && (
                <ActivityFeed
                  workspaceId={workspaceId}
                  membersById={membersById}
                />
              )}
              {workspaceId && (
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Workspace settings"
                  nativeButton={false}
                  render={
                    <Link to={`/workspaces/${workspaceId}/settings`}>
                      <SettingsIcon className="size-4" />
                    </Link>
                  }
                />
              )}
              {canCreate && <CreateProjectDialog workspaceId={workspaceId!} />}
            </>
          }
        />

        {!isLoadingWorkspace && workspace && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Active projects"
              value={activeProjects.length}
              icon={FolderKanbanIcon}
            />
            <StatCard
              label="Archived"
              value={archivedProjects.length}
              icon={ArchiveIcon}
            />
            <StatCard
              label="Members"
              value={workspace.members.length}
              icon={UsersIcon}
            />
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <EmptyState
            icon={FolderKanbanIcon}
            title="No projects yet"
            description="Create a project to start adding tasks for your team."
            action={
              canCreate ? (
                <CreateProjectDialog workspaceId={workspaceId!} />
              ) : undefined
            }
          />
        )}

        {!isLoading && projects && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                canEdit={canCreate}
                canArchive={canArchive}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
