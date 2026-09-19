import { cn } from 'cn';
import type { TaskPriority } from '@/types/api';

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  LOW: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  HIGH: {
    label: 'High',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  URGENT: { label: 'Urgent', className: 'bg-destructive/10 text-destructive' },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
