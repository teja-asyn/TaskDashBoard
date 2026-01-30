import { apiSlice } from './apiSlice';
import type { Project } from '../../types';

export const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, { name: string; description?: string }>({
      query: (project) => ({
        url: '/projects',
        method: 'POST',
        body: project,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: string; updates: Partial<Project> }>({
      query: ({ id, updates }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Project', id }, 'Project'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectTasks: builder.query<{ tasks: any[]; pagination: any }, { projectId: string; status?: string; priority?: string; assignee?: string; search?: string; page?: number; limit?: number }>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/tasks`,
        params,
      }),
      providesTags: ['Task'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectTasksQuery,
} = projectApi;