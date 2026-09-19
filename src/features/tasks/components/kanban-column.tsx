import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from '@/features/tasks/components/task-card';
import type { PublicUser, Task, TaskStatus } from '@/types/api';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  membersById: Map<string, PublicUser>;
  onOpenTask: (taskId: string) => void;
}

export function KanbanColumn({
  status,
  title,
  tasks,
  membersById,
  onOpenTask,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="bg-muted/40 flex w-72 shrink-0 flex-col gap-3 rounded-xl p-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-muted-foreground text-xs">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="flex min-h-8 flex-col gap-2">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={
                task.assigneeId ? membersById.get(task.assigneeId) : undefined
              }
              onOpen={() => onOpenTask(task.id)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
