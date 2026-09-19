import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2Icon, Trash2Icon, XIcon } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge } from '@/features/tasks/components/priority-badge';
import {
  useDeleteTaskMutation,
  useGetTaskQuery,
  useUpdateTaskMutation,
} from '@/features/tasks/tasks-api';
import { SubtaskList } from '@/features/subtasks/components/subtask-list';
import { CommentThread } from '@/features/comments/components/comment-thread';
import { AttachmentList } from '@/features/attachments/components/attachment-list';
import { getErrorMessage } from '@/lib/error-message';
import type { PublicUser, TaskPriority } from '@/types/api';

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const NO_ASSIGNEE = 'none';

interface TaskDetailSheetProps {
  projectId: string;
  taskId: string | null;
  members: PublicUser[];
  currentUserId: string;
  canModerate: boolean;
  onClose: () => void;
}

export function TaskDetailSheet({
  projectId,
  taskId,
  members,
  currentUserId,
  canModerate,
  onClose,
}: TaskDetailSheetProps) {
  const { data: task, isLoading } = useGetTaskQuery(
    { projectId, taskId: taskId! },
    { skip: !taskId },
  );
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Reset the editable draft only when a genuinely different task loads
  // (keyed on id, not object reference) — a refetch of the SAME task after
  // saving one field must not clobber an in-progress edit to the other.
  // Adjusting state during render avoids the extra render pass a
  // useEffect-based sync would cost here.
  const [loadedTaskId, setLoadedTaskId] = useState<string | null>(null);
  if (task && task.id !== loadedTaskId) {
    setLoadedTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? '');
  }

  async function saveField(field: 'title' | 'description', value: string) {
    if (!task) return;
    const current = field === 'title' ? task.title : (task.description ?? '');
    if (value === current) return;
    try {
      await updateTask({ projectId, taskId: task.id, [field]: value }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handlePriorityChange(priority: TaskPriority | null) {
    if (!task || !priority) return;
    try {
      await updateTask({ projectId, taskId: task.id, priority }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleAssigneeChange(value: string | null) {
    if (!task || !value) return;
    try {
      await updateTask({
        projectId,
        taskId: task.id,
        assigneeId: value === NO_ASSIGNEE ? null : value,
      }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleDueDateChange(dueDate: string) {
    if (!task) return;
    try {
      await updateTask({
        projectId,
        taskId: task.id,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleDelete() {
    if (!task) return;
    try {
      await deleteTask({ projectId, taskId: task.id }).unwrap();
      toast.success('Task deleted');
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {isLoading || !task ? (
          <div className="flex flex-col gap-3 p-6">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">Edit task</SheetTitle>
              <SheetDescription className="sr-only">
                View and edit task details.
              </SheetDescription>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => saveField('title', title)}
                className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              />
            </SheetHeader>

            <div className="flex flex-col gap-5 px-6 pb-6">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => saveField('description', description)}
                placeholder="Add a description"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    Priority
                  </span>
                  <Select
                    value={task.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        <PriorityBadge priority={task.priority} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    Assignee
                  </span>
                  <Select
                    value={task.assigneeId ?? NO_ASSIGNEE}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_ASSIGNEE}>Unassigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs">Due date</span>
                <div className="flex items-center gap-1">
                  {/* Keyed on the task's own due date (not just task.id) so
                      this uncontrolled field remounts — and its displayed
                      value resets — both when switching tasks AND after a
                      successful save/clear; defaultValue alone only applies
                      on mount, never on later prop changes. */}
                  <Input
                    key={`${task.id}-${task.dueDate ?? 'none'}`}
                    type="date"
                    defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-fit"
                  />
                  {task.dueDate && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Clear due date"
                      onClick={() => handleDueDateChange('')}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <Separator />
              <SubtaskList projectId={projectId} taskId={task.id} />
              <Separator />
              <AttachmentList
                projectId={projectId}
                taskId={task.id}
                currentUserId={currentUserId}
                canModerate={canModerate}
              />
              <Separator />
              <CommentThread
                projectId={projectId}
                taskId={task.id}
                currentUserId={currentUserId}
                canModerate={canModerate}
              />
            </div>

            {canModerate && (
              <SheetFooter>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <Trash2Icon />
                  )}
                  Delete task
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
