import { apiSlice } from './apiSlice';
import type { Task, CreateTaskData, UpdateTaskData } from '../../types';

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllTasks: builder.query<{ tasks: Task[]; pagination: any }, { status?: string; priority?: string; assignee?: string; search?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/tasks',
        params,
      }),
      providesTags: ['Task'],
    }),
    getTaskDetails: builder.query<Task, string>({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (_result, _error, taskId) => [{ type: 'Task', id: taskId }],
    }),
    createTask: builder.mutation<Task, CreateTaskData>({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Task', 'Project'],
    }),
    updateTask: builder.mutation<Task, { id: string; updates: UpdateTaskData }>({
      query: ({ id, updates }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Task', id }, 'Task', 'Project'],
    }),
    updateTaskStatus: builder.mutation<{ _id: string; status: string; updatedAt: string }, { id: string; status: 'todo' | 'in-progress' | 'done' }>({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Task', id }, 'Task', 'Project'],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Project'],
    }),
    addSubtask: builder.mutation<any, { taskId: string; title: string; description?: string; assigneeId?: string; dueDate?: string }>({
      query: ({ taskId, ...subtask }) => ({
        url: `/tasks/${taskId}/subtasks`,
        method: 'POST',
        body: subtask,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }, 'Task'],
    }),
    updateSubtask: builder.mutation<any, { taskId: string; subtaskId: string; updates: any }>({
      query: ({ taskId, subtaskId, updates }) => ({
        url: `/tasks/${taskId}/subtasks/${subtaskId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }, 'Task'],
    }),
    deleteSubtask: builder.mutation<void, { taskId: string; subtaskId: string }>({
      query: ({ taskId, subtaskId }) => ({
        url: `/tasks/${taskId}/subtasks/${subtaskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }, 'Task'],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useGetTaskDetailsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useAddSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} = taskApi;