import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAppDispatch } from '@/app/hooks';
import { tasksApi } from '@/features/tasks/tasks-api';
import { commentsApi } from '@/features/comments/comments-api';
import { subtasksApi } from '@/features/subtasks/subtasks-api';
import { attachmentsApi } from '@/features/attachments/attachments-api';

// Keeps the Kanban board (and its open task detail panel) in sync with
// changes made by other users in the same project. Rather than hand-patch
// the RTK Query cache per event shape, each event just invalidates the
// relevant list tag — RTK Query refetches automatically, which is simpler
// to keep correct than manually merging every possible event payload.
export function useRealtimeProject(projectId: string | undefined) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit('project:join', projectId);

    const invalidateTasks = () =>
      dispatch(
        tasksApi.util.invalidateTags([
          { type: 'Task', id: `LIST-${projectId}` },
        ]),
      );
    const invalidateComments = (payload: { taskId: string }) =>
      dispatch(
        commentsApi.util.invalidateTags([
          { type: 'Comment', id: `LIST-${payload.taskId}` },
        ]),
      );
    const invalidateSubtasks = (payload: { taskId: string }) =>
      dispatch(
        subtasksApi.util.invalidateTags([
          { type: 'Subtask', id: `LIST-${payload.taskId}` },
        ]),
      );
    const invalidateAttachments = (payload: { taskId: string }) =>
      dispatch(
        attachmentsApi.util.invalidateTags([
          { type: 'Attachment', id: `LIST-${payload.taskId}` },
        ]),
      );

    socket.on('task:created', invalidateTasks);
    socket.on('task:updated', invalidateTasks);
    socket.on('task:moved', invalidateTasks);
    socket.on('task:deleted', invalidateTasks);
    socket.on('comment:created', invalidateComments);
    socket.on('comment:updated', invalidateComments);
    socket.on('comment:deleted', invalidateComments);
    socket.on('subtask:created', invalidateSubtasks);
    socket.on('subtask:updated', invalidateSubtasks);
    socket.on('subtask:deleted', invalidateSubtasks);
    socket.on('attachment:created', invalidateAttachments);
    socket.on('attachment:deleted', invalidateAttachments);

    return () => {
      socket.emit('project:leave', projectId);
      socket.off('task:created', invalidateTasks);
      socket.off('task:updated', invalidateTasks);
      socket.off('task:moved', invalidateTasks);
      socket.off('task:deleted', invalidateTasks);
      socket.off('comment:created', invalidateComments);
      socket.off('comment:updated', invalidateComments);
      socket.off('comment:deleted', invalidateComments);
      socket.off('subtask:created', invalidateSubtasks);
      socket.off('subtask:updated', invalidateSubtasks);
      socket.off('subtask:deleted', invalidateSubtasks);
      socket.off('attachment:created', invalidateAttachments);
      socket.off('attachment:deleted', invalidateAttachments);
    };
  }, [projectId, dispatch]);
}
