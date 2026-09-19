import { Link, useParams } from 'react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { AddMemberDialog } from '@/features/workspaces/components/add-member-dialog';
import { MemberRow } from '@/features/workspaces/components/member-row';
import { useGetWorkspaceQuery } from '@/features/workspaces/workspaces-api';

export function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId!);

  const myMembership = workspace?.members.find(
    (m) => m.userId === currentUser?.userId,
  );
  const isOwner = myMembership?.role === 'OWNER';
  const canRemove =
    myMembership?.role === 'OWNER' || myMembership?.role === 'ADMIN';

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <Link
          to={`/workspaces/${workspaceId}`}
          className="text-muted-foreground hover:text-foreground -mb-2 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeftIcon className="size-4" /> Back to projects
        </Link>

        {isLoading && <Skeleton className="h-8 w-48" />}

        {workspace && (
          <>
            <PageHeader
              title={workspace.name}
              description={`${workspace.members.length} member${workspace.members.length === 1 ? '' : 's'}`}
              actions={
                canRemove && <AddMemberDialog workspaceId={workspace.id} />
              }
            />

            <div className="divide-y rounded-xl border px-4">
              {workspace.members.map((member) => (
                <MemberRow
                  key={member.id}
                  workspaceId={workspace.id}
                  member={member}
                  currentUserId={currentUser!.userId}
                  isOwner={isOwner}
                  canRemove={canRemove}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
