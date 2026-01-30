import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 Unauthorized errors (token expired)
  if (result.error && result.error.status === 401) {
    // Clear cache and logout on unauthorized
    api.dispatch(apiSlice.util.resetApiState());
    api.dispatch({ type: 'auth/logout' });
  }
  
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project', 'Task', 'User'],
  endpoints: () => ({}),
});

// Export for use in other API slices
export type { BaseQueryFn, FetchArgs, FetchBaseQueryError };