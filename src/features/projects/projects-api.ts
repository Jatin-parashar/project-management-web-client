import { api } from '@/lib/api';
import type { Project } from '@/types/api';

export const projectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listProjects: builder.query<
      Project[],
      { workspaceId: string; includeArchived?: boolean }
    >({
      query: ({ workspaceId, includeArchived }) => ({
        url: `/workspaces/${workspaceId}/projects`,
        params: includeArchived ? { includeArchived: 'true' } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Project' as const, id: p.id })),
              { type: 'Project' as const, id: 'LIST' },
            ]
          : [{ type: 'Project' as const, id: 'LIST' }],
    }),
    getProject: builder.query<
      Project,
      { workspaceId: string; projectId: string }
    >({
      query: ({ workspaceId, projectId }) =>
        `/workspaces/${workspaceId}/projects/${projectId}`,
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),
    createProject: builder.mutation<
      Project,
      { workspaceId: string; name: string; description?: string }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/projects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation<
      Project,
      {
        workspaceId: string;
        projectId: string;
        name?: string;
        description?: string;
      }
    >({
      query: ({ workspaceId, projectId, ...body }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),
    archiveProject: builder.mutation<
      Project,
      { workspaceId: string; projectId: string }
    >({
      query: ({ workspaceId, projectId }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    restoreProject: builder.mutation<
      Project,
      { workspaceId: string; projectId: string }
    >({
      query: ({ workspaceId, projectId }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useRestoreProjectMutation,
} = projectsApi;
