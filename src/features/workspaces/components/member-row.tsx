import { Loader2Icon, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/features/workspaces/components/role-badge';
import {
  useRemoveWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
} from '@/features/workspaces/workspaces-api';
import { getErrorMessage } from '@/lib/error-message';
import type { Role, WorkspaceMemberWithUser } from '@/types/api';

const ASSIGNABLE_ROLES: Role[] = ['ADMIN', 'MANAGER', 'MEMBER', 'GUEST'];

interface MemberRowProps {
  workspaceId: string;
  member: WorkspaceMemberWithUser;
  currentUserId: string;
  isOwner: boolean;
  canRemove: boolean;
}

export function MemberRow({
  workspaceId,
  member,
  currentUserId,
  isOwner,
  canRemove,
}: MemberRowProps) {
  const [updateRole, { isLoading: isUpdatingRole }] =
    useUpdateWorkspaceMemberRoleMutation();
  const [removeMember, { isLoading: isRemoving }] =
    useRemoveWorkspaceMemberMutation();

  const isTargetOwner = member.role === 'OWNER';
  const isSelf = member.userId === currentUserId;
  const canChangeRole = isOwner && !isTargetOwner;
  const canActuallyRemove = canRemove && !isTargetOwner && !isSelf;

  async function handleRoleChange(role: Role) {
    try {
      await updateRole({ workspaceId, userId: member.userId, role }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleRemove() {
    try {
      await removeMember({ workspaceId, userId: member.userId }).unwrap();
      toast.success(`${member.user.name} removed from workspace`);
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarFallback>
            {member.user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {member.user.name}{' '}
            {isSelf && <span className="text-muted-foreground">(you)</span>}
          </p>
          <p className="text-muted-foreground truncate text-sm">
            {member.user.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(isUpdatingRole || isRemoving) && (
          <Loader2Icon className="text-muted-foreground size-4 animate-spin" />
        )}
        {canChangeRole || canActuallyRemove ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Manage ${member.user.name}`}
                >
                  <RoleBadge role={member.role} />
                  <MoreVerticalIcon className="ml-1 size-3" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {canChangeRole && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-muted-foreground font-normal">
                    Change role
                  </DropdownMenuLabel>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      disabled={role === member.role}
                      onClick={() => handleRoleChange(role)}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              )}
              {canChangeRole && canActuallyRemove && <DropdownMenuSeparator />}
              {canActuallyRemove && (
                <DropdownMenuItem variant="destructive" onClick={handleRemove}>
                  Remove from workspace
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </div>
    </div>
  );
}
