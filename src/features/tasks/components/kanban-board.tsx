import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { KanbanColumn } from '@/features/tasks/components/kanban-column';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useUpdateTaskStatusMutation } from '@/features/tasks/tasks-api';
import { getErrorMessage } from '@/lib/error-message';
import type { PublicUser, Task, TaskStatus } from '@/types/api';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To do' },
  { status: 'IN_PROGRESS', title: 'In progress' },
  { status: 'DONE', title: 'Done' },
];

type ColumnState = Record<TaskStatus, Task[]>;

function groupByStatus(tasks: Task[]): ColumnState {
  const grouped: ColumnState = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const task of tasks) grouped[task.status].push(task);
  for (const status of Object.keys(grouped) as TaskStatus[]) {
    grouped[status].sort((a, b) => a.position - b.position);
  }
  return grouped;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  membersById: Map<string, PublicUser>;
  onOpenTask: (taskId: string) => void;
}

export function KanbanBoard({
  projectId,
  tasks,
  membersById,
  onOpenTask,
}: KanbanBoardProps) {
  const [updateStatus] = useUpdateTaskStatusMutation();
  const [columns, setColumns] = useState<ColumnState>(() =>
    groupByStatus(tasks),
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // RTK Query keeps `tasks` referentially stable across renders unless the
  // underlying cache data actually changed, so this only re-derives columns
  // on a real fetch/update — not a plain re-render. Adjusting state directly
  // during render (React's documented escape hatch) avoids the extra
  // commit-then-effect render pass a useEffect here would cost.
  const [syncedTasks, setSyncedTasks] = useState(tasks);
  if (tasks !== syncedTasks) {
    setSyncedTasks(tasks);
    setColumns(groupByStatus(tasks));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function locate(id: string): TaskStatus | undefined {
    return (Object.keys(columns) as TaskStatus[]).find((status) =>
      columns[status].some((t) => t.id === id),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const status = locate(event.active.id as string);
    if (!status) return;
    setActiveTask(
      columns[status].find((t) => t.id === event.active.id) ?? null,
    );
  }

  // Live-preview the move as the card crosses into another column, so the
  // board visually settles into place before the drop — the actual mutation
  // only fires once in handleDragEnd.
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const fromStatus = locate(active.id as string);
    const overIsColumn = COLUMNS.some((c) => c.status === over.id);
    const toStatus = overIsColumn
      ? (over.id as TaskStatus)
      : locate(over.id as string);
    if (!fromStatus || !toStatus || fromStatus === toStatus) return;

    setColumns((prev) => {
      const fromItems = [...prev[fromStatus]];
      const activeIndex = fromItems.findIndex((t) => t.id === active.id);
      if (activeIndex === -1) return prev;
      const [moved] = fromItems.splice(activeIndex, 1);
      const toItems = [...prev[toStatus]];
      const overIndex = overIsColumn
        ? toItems.length
        : toItems.findIndex((t) => t.id === over.id);
      toItems.splice(overIndex === -1 ? toItems.length : overIndex, 0, {
        ...moved,
        status: toStatus,
      });
      return { ...prev, [fromStatus]: fromItems, [toStatus]: toItems };
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const status = locate(active.id as string);
    if (!status) return;

    const items = columns[status];
    const activeIndex = items.findIndex((t) => t.id === active.id);
    const overIsColumn = COLUMNS.some((c) => c.status === over.id);
    const overIndex = overIsColumn
      ? -1
      : items.findIndex((t) => t.id === over.id);

    const finalItems =
      !overIsColumn && overIndex !== -1
        ? arrayMove(items, activeIndex, overIndex)
        : items;
    if (finalItems !== items) {
      setColumns((prev) => ({ ...prev, [status]: finalItems }));
    }
    const finalPosition = finalItems.findIndex((t) => t.id === active.id);

    try {
      await updateStatus({
        projectId,
        taskId: active.id as string,
        status,
        position: finalPosition,
      }).unwrap();
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
      setColumns(groupByStatus(tasks));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={columns[column.status]}
            membersById={membersById}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            assignee={
              activeTask.assigneeId
                ? membersById.get(activeTask.assigneeId)
                : undefined
            }
            onOpen={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
