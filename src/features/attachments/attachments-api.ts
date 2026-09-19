import { api } from '@/lib/api';
import type { Attachment } from '@/types/api';

export const attachmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAttachments: builder.query<
      Attachment[],
      { projectId: string; taskId: string }
    >({
      query: ({ projectId, taskId }) =>
        `/projects/${projectId}/tasks/${taskId}/attachments`,
      providesTags: (result, _error, { taskId }) =>
        result
          ? [
              ...result.map((a) => ({ type: 'Attachment' as const, id: a.id })),
              { type: 'Attachment' as const, id: `LIST-${taskId}` },
            ]
          : [{ type: 'Attachment' as const, id: `LIST-${taskId}` }],
    }),
    uploadAttachment: builder.mutation<
      Attachment,
      { projectId: string; taskId: string; file: File }
    >({
      query: ({ projectId, taskId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/projects/${projectId}/tasks/${taskId}/attachments`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Attachment', id: `LIST-${taskId}` },
      ],
    }),
    deleteAttachment: builder.mutation<
      void,
      { projectId: string; taskId: string; attachmentId: string }
    >({
      query: ({ projectId, taskId, attachmentId }) => ({
        url: `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Attachment', id: `LIST-${taskId}` },
      ],
    }),
  }),
});

export const {
  useListAttachmentsQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} = attachmentsApi;
