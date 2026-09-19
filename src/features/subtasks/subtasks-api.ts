import { api } from '@/lib/api';
import type { Subtask } from '@/types/api';

export const subtasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listSubtasks: builder.query<
      Subtask[],
      { projectId: string; taskId: string }
    >({
      query: ({ projectId, taskId }) =>
        `/projects/${projectId}/tasks/${taskId}/subtasks`,
      providesTags: (result, _error, { taskId }) =>
        result
          ? [
              ...result.map((s) => ({ type: 'Subtask' as const, id: s.id })),
              { type: 'Subtask' as const, id: `LIST-${taskId}` },
            ]
          : [{ type: 'Subtask' as const, id: `LIST-${taskId}` }],
    }),
    createSubtask: builder.mutation<
      Subtask,
      { projectId: string; taskId: string; title: string }
    >({
      query: ({ projectId, taskId, title }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/subtasks`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Subtask', id: `LIST-${taskId}` },
      ],
    }),
    updateSubtask: builder.mutation<
      Subtask,
      {
        projectId: string;
        taskId: string;
        subtaskId: string;
        title?: string;
        completed?: boolean;
      }
    >({
      query: ({ projectId, taskId, subtaskId, ...body }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Subtask', id: `LIST-${taskId}` },
      ],
    }),
    deleteSubtask: builder.mutation<
      void,
      { projectId: string; taskId: string; subtaskId: string }
    >({
      query: ({ projectId, taskId, subtaskId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Subtask', id: `LIST-${taskId}` },
      ],
    }),
  }),
});

export const {
  useListSubtasksQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} = subtasksApi;
