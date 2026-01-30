import { apiSlice } from './apiSlice';
import type { User } from '../../types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const { useGetCurrentUserQuery } = authApi;

