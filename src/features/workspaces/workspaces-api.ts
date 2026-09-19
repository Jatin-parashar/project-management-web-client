import { api } from '@/lib/api';
import type {
  Role,
  Workspace,
  WorkspaceDetail,
  WorkspaceMember,
  WorkspaceMemberWithUser,
  WorkspaceSummary,
} from '@/types/api';

export const workspacesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listWorkspaces: builder.query<WorkspaceSummary[], void>({
      query: () => '/workspaces',
      providesTags: (result) =>
        result
          ? [
              ...result.map((w) => ({ type: 'Workspace' as const, id: w.id })),
              { type: 'Workspace' as const, id: 'LIST' },
            ]
          : [{ type: 'Workspace' as const, id: 'LIST' }],
    }),
    getWorkspace: builder.query<WorkspaceDetail, string>({
      query: (workspaceId) => `/workspaces/${workspaceId}`,
      providesTags: (_result, _error, workspaceId) => [
        { type: 'Workspace', id: workspaceId },
      ],
    }),
    createWorkspace: builder.mutation<Workspace, { name: string }>({
      query: (body) => ({ url: '/workspaces', method: 'POST', body }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
    }),
    addWorkspaceMember: builder.mutation<
      WorkspaceMemberWithUser,
      { workspaceId: string; email: string; role: Role }
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Workspace', id: workspaceId },
      ],
    }),
    updateWorkspaceMemberRole: builder.mutation<
      WorkspaceMember,
      { workspaceId: string; userId: string; role: Role }
    >({
      query: ({ workspaceId, userId, role }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Workspace', id: workspaceId },
      ],
    }),
    removeWorkspaceMember: builder.mutation<
      void,
      { workspaceId: string; userId: string }
    >({
      query: ({ workspaceId, userId }) => ({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Workspace', id: workspaceId },
      ],
    }),
  }),
});

export const {
  useListWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useAddWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
  useRemoveWorkspaceMemberMutation,
} = workspacesApi;
