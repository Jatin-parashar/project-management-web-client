import { api } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus } from '@/types/api';

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listTasks: builder.query<Task[], { projectId: string }>({
      query: ({ projectId }) => `/projects/${projectId}/tasks`,
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.map((t) => ({ type: 'Task' as const, id: t.id })),
              { type: 'Task' as const, id: `LIST-${projectId}` },
            ]
          : [{ type: 'Task' as const, id: `LIST-${projectId}` }],
    }),
    getTask: builder.query<Task, { projectId: string; taskId: string }>({
      query: ({ projectId, taskId }) =>
        `/projects/${projectId}/tasks/${taskId}`,
      providesTags: (_result, _error, { taskId }) => [
        { type: 'Task', id: taskId },
      ],
    }),
    createTask: builder.mutation<
      Task,
      {
        projectId: string;
        title: string;
        description?: string;
        priority?: TaskPriority;
        assigneeId?: string;
        dueDate?: string;
      }
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/tasks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Task', id: `LIST-${projectId}` },
      ],
    }),
    updateTask: builder.mutation<
      Task,
      {
        projectId: string;
        taskId: string;
        title?: string;
        description?: string;
        priority?: TaskPriority;
        assigneeId?: string | null;
        dueDate?: string | null;
      }
    >({
      query: ({ projectId, taskId, ...body }) => ({
        url: `/projects/${projectId}/tasks/${taskId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Task', id: taskId },
      ],
    }),
    updateTaskStatus: builder.mutation<
      Task,
      {
        projectId: string;
        taskId: string;
        status: TaskStatus;
        position?: number;
      }
    >({
      query: ({ projectId, taskId, ...body }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId, taskId }) => [
        { type: 'Task', id: taskId },
        { type: 'Task', id: `LIST-${projectId}` },
      ],
    }),
    deleteTask: builder.mutation<void, { projectId: string; taskId: string }>({
      query: ({ projectId, taskId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Task', id: `LIST-${projectId}` },
      ],
    }),
  }),
});

export const {
  useListTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} = tasksApi;
