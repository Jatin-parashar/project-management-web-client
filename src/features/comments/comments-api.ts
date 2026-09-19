import { api } from '@/lib/api';
import type { Comment } from '@/types/api';

export const commentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listComments: builder.query<
      Comment[],
      { projectId: string; taskId: string }
    >({
      query: ({ projectId, taskId }) =>
        `/projects/${projectId}/tasks/${taskId}/comments`,
      providesTags: (result, _error, { taskId }) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Comment' as const, id: c.id })),
              { type: 'Comment' as const, id: `LIST-${taskId}` },
            ]
          : [{ type: 'Comment' as const, id: `LIST-${taskId}` }],
    }),
    createComment: builder.mutation<
      Comment,
      { projectId: string; taskId: string; content: string }
    >({
      query: ({ projectId, taskId, content }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comment', id: `LIST-${taskId}` },
      ],
    }),
    updateComment: builder.mutation<
      Comment,
      { projectId: string; taskId: string; commentId: string; content: string }
    >({
      query: ({ projectId, taskId, commentId, content }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comment', id: `LIST-${taskId}` },
      ],
    }),
    deleteComment: builder.mutation<
      void,
      { projectId: string; taskId: string; commentId: string }
    >({
      query: ({ projectId, taskId, commentId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comment', id: `LIST-${taskId}` },
      ],
    }),
  }),
});

export const {
  useListCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
