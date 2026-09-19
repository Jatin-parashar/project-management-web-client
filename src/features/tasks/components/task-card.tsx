import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon } from 'lucide-react';
import { cn } from 'cn';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PriorityBadge } from '@/features/tasks/components/priority-badge';
import type { PublicUser, Task } from '@/types/api';

interface TaskCardProps {
  task: Task;
  assignee?: PublicUser;
  onOpen: () => void;
}

export function TaskCard({ task, assignee, onOpen }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        'cursor-grab touch-none py-3 active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm leading-snug font-medium">{task.title}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <CalendarIcon className="size-3" />
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          {assignee && (
            <Avatar size="sm">
              <AvatarFallback>
                {assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
