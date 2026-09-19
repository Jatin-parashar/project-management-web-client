import { api } from '@/lib/api';
import type { ActivityLogEntry } from '@/types/api';

export const activityLogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listActivity: builder.query<
      ActivityLogEntry[],
      { workspaceId: string; limit?: number }
    >({
      query: ({ workspaceId, limit }) => ({
        url: `/workspaces/${workspaceId}/activity`,
        params: limit ? { limit } : undefined,
      }),
      providesTags: (_result, _error, { workspaceId }) => [
        { type: 'Activity', id: workspaceId },
      ],
    }),
  }),
});

export const { useListActivityQuery } = activityLogApi;
