import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return 'Something went wrong';

  if ('status' in error) {
    const data = error.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    return `Request failed (${String(error.status)})`;
  }

  return error.message ?? 'Something went wrong';
}
