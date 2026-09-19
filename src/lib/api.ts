import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/base-query';

// Single base API slice — every feature injects its own endpoints into this
// via `api.injectEndpoints()` instead of creating separate createApi
// instances, which is RTK Query's recommended code-splitting pattern (one
// shared cache, one middleware, tags shared across features when needed).
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Workspace',
    'Project',
    'Task',
    'Comment',
    'Subtask',
    'Attachment',
    'Activity',
  ],
  endpoints: () => ({}),
});
