import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeftIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  ListTodoIcon,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { useGetProjectQuery } from '@/features/projects/projects-api';
import { useGetWorkspaceQuery } from '@/features/workspaces/workspaces-api';
import { useListTasksQuery } from '@/features/tasks/tasks-api';
import { KanbanBoard } from '@/features/tasks/components/kanban-board';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { useRealtimeProject } from '@/features/tasks/use-realtime-project';
import type { Role } from '@/types/api';

const CAN_MODERATE: Role[] = ['OWNER', 'ADMIN', 'MANAGER'];

export function KanbanPage() {
  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const { data: project, isLoading: isLoadingProject } = useGetProjectQuery({
    workspaceId: workspaceId!,
    projectId: projectId!,
  });
  const { data: workspace } = useGetWorkspaceQuery(workspaceId!);
  const { data: tasks, isLoading: isLoadingTasks } = useListTasksQuery({
    projectId: projectId!,
  });

  const members = useMemo(
    () => workspace?.members.map((m) => m.user) ?? [],
    [workspace],
  );
  const membersById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  );
  const myRole = workspace?.members.find(
    (m) => m.userId === currentUser?.userId,
  )?.role;
  const canModerate = !!myRole && CAN_MODERATE.includes(myRole);

  const isLoading = isLoadingProject || isLoadingTasks;
  const todoCount = tasks?.filter((t) => t.status === 'TODO').length ?? 0;
  const inProgressCount =
    tasks?.filter((t) => t.status === 'IN_PROGRESS').length ?? 0;
  const doneCount = tasks?.filter((t) => t.status === 'DONE').length ?? 0;

  useRealtimeProject(projectId);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
        <Link
          to={`/workspaces/${workspaceId}`}
          className="text-muted-foreground hover:text-foreground -mb-2 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeftIcon className="size-4" /> Back to projects
        </Link>

        <PageHeader
          title={
            isLoadingProject ? <Skeleton className="h-8 w-48" /> : project?.name
          }
          actions={
            projectId && (
              <CreateTaskDialog projectId={projectId} members={members} />
            )
          }
        />

        {!isLoading && tasks && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="To do" value={todoCount} icon={CircleDashedIcon} />
            <StatCard
              label="In progress"
              value={inProgressCount}
              icon={ListTodoIcon}
              iconClassName="text-blue-500"
              valueClassName="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              label="Done"
              value={doneCount}
              icon={CircleCheckIcon}
              iconClassName="text-emerald-500"
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
          </div>
        )}

        {isLoading && (
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && tasks && projectId && (
          <KanbanBoard
            projectId={projectId}
            tasks={tasks}
            membersById={membersById}
            onOpenTask={setOpenTaskId}
          />
        )}
      </div>

      {projectId && (
        <TaskDetailSheet
          projectId={projectId}
          taskId={openTaskId}
          members={members}
          currentUserId={currentUser!.userId}
          canModerate={canModerate}
          onClose={() => setOpenTaskId(null)}
        />
      )}
    </AppShell>
  );
}
