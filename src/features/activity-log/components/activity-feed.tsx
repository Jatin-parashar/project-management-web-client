import { HistoryIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useListActivityQuery } from '@/features/activity-log/activity-log-api';
import { formatActivity } from '@/features/activity-log/format-activity';
import type { PublicUser } from '@/types/api';

interface ActivityFeedProps {
  workspaceId: string;
  membersById: Map<string, PublicUser>;
}

export function ActivityFeed({ workspaceId, membersById }: ActivityFeedProps) {
  const { data: entries, isLoading } = useListActivityQuery({
    workspaceId,
    limit: 100,
  });

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" aria-label="View activity log">
            <HistoryIcon className="size-4" />
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Activity</SheetTitle>
          <SheetDescription>
            Recent changes across this workspace.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-6 pb-6">
          {isLoading && <Skeleton className="h-32 rounded-lg" />}
          {!isLoading && entries?.length === 0 && (
            <EmptyState
              icon={HistoryIcon}
              title="No activity yet"
              description="Actions across this workspace will show up here."
            />
          )}
          {entries?.map((entry) => {
            const actorName = membersById.get(entry.actorId)?.name ?? 'Someone';
            return (
              <div
                key={entry.id}
                className="flex flex-col gap-0.5 border-b pb-3 last:border-b-0"
              >
                <p className="text-sm">{formatActivity(entry, actorName)}</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(entry.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
