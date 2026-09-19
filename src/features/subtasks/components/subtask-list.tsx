import { useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateSubtaskMutation,
  useDeleteSubtaskMutation,
  useListSubtasksQuery,
  useUpdateSubtaskMutation,
} from '@/features/subtasks/subtasks-api';
import { getErrorMessage } from '@/lib/error-message';

interface SubtaskListProps {
  projectId: string;
  taskId: string;
}

export function SubtaskList({ projectId, taskId }: SubtaskListProps) {
  const { data: subtasks, isLoading } = useListSubtasksQuery({
    projectId,
    taskId,
  });
  const [createSubtask, { isLoading: isCreating }] = useCreateSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [title, setTitle] = useState('');

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      await createSubtask({ projectId, taskId, title: title.trim() }).unwrap();
      setTitle('');
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleToggle(subtaskId: string, completed: boolean) {
    try {
      await updateSubtask({ projectId, taskId, subtaskId, completed }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  async function handleDelete(subtaskId: string) {
    try {
      await deleteSubtask({ projectId, taskId, subtaskId }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  const completedCount = subtasks?.filter((s) => s.completed).length ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Subtasks</h3>
        {subtasks && subtasks.length > 0 && (
          <span className="text-muted-foreground text-xs">
            {completedCount}/{subtasks.length}
          </span>
        )}
      </div>

      {isLoading && <Skeleton className="h-16 rounded-lg" />}

      {subtasks?.map((subtask) => (
        <div key={subtask.id} className="group flex items-center gap-2">
          <input
            type="checkbox"
            checked={subtask.completed}
            onChange={(e) => handleToggle(subtask.id, e.target.checked)}
            className="accent-primary size-4 rounded"
            aria-label={subtask.title}
          />
          <span
            className={`flex-1 text-sm ${subtask.completed ? 'text-muted-foreground line-through' : ''}`}
          >
            {subtask.title}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100"
            aria-label={`Delete ${subtask.title}`}
            onClick={() => handleDelete(subtask.id)}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="mt-1 flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a subtask"
          className="h-8"
        />
        <Button
          type="submit"
          variant="outline"
          size="icon"
          disabled={isCreating || !title.trim()}
          aria-label="Add subtask"
        >
          <PlusIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
}
