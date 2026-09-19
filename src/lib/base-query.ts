import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { clearCredentials, setCredentials } from '@/features/auth/auth-slice';
import type { RootState } from '@/app/store';

// Multiple queries can 401 at the same moment (e.g. a page that fires several
// requests on mount). Without serializing the refresh, each one would call
// POST /auth/refresh independently and race the backend's refresh-token
// rotation, invalidating all but one of them. This mutex ensures only the
// first 401 actually triggers a refresh; the rest wait for it to finish.
const refreshMutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  const isRefreshCall =
    typeof args !== 'string' && args.url === '/auth/refresh';

  if (result.error?.status === 401 && !isRefreshCall) {
    if (!refreshMutex.isLocked()) {
      const release = await refreshMutex.acquire();
      try {
        const refreshResult = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        );
        if (refreshResult.data) {
          const { accessToken } = refreshResult.data as { accessToken: string };
          api.dispatch(setCredentials({ accessToken }));
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(clearCredentials());
        }
      } finally {
        release();
      }
    } else {
      await refreshMutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
