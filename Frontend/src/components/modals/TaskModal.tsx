import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FiX,
  FiUser,
  FiCalendar,
  FiTag,
  FiAlignLeft,
  FiSend,
  FiSave,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../store/slices/uiSlice';
import type { RootState } from '../../store/store';
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../store/api/taskApi';
import { toast } from 'react-hot-toast';
import { sanitizeHTML } from '../../utils/sanitize';
import RichTextEditor from './RichTextEditor';
import type { CreateTaskData, UpdateTaskData } from '../../types';
import Tooltip from '../common/Tooltip';

interface TaskModalProps {
  data?: {
    _id?: string;
    title?: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    projectId?: string;
    assigneeId?: string | { _id: string; name: string; email: string };
    dueDate?: string;
    isEditing?: boolean;
  };
  onClose?: () => void;
}

// Create a proper type for dueDate
type DueDateValue = Date | string | null | undefined;

// Validation schema with proper date handling
const taskSchema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title must be less than 200 characters'),
  description: yup.string().max(10000, 'Description must be less than 10000 characters'),
  status: yup.string().oneOf(['todo', 'in-progress', 'done']).required('Status is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required('Priority is required'),
  assigneeId: yup.string().nullable(),
  dueDate: yup
    .mixed()
    .nullable()
    .test('is-date', 'Invalid date format', (value) => {
      if (!value) return true; // Allow null/empty
      if (value instanceof Date) return !isNaN(value.getTime());
      if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return false;
    })
    .transform((value) => {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime()) ? date : null;
      }
      return null;
    }),
  estimatedHours: yup.number().min(0).max(1000).nullable(),
  labels: yup.array().of(yup.string().max(20)),
});

type TaskFormData = yup.InferType<typeof taskSchema>;


const TaskModal: React.FC<TaskModalProps> = ({ data, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  
  const isEditMode = data?.isEditing || !!data?._id;
  const isLoading = isCreating || isUpdating;

  // TODO: Fetch team members from backend API when available
  // For now, only show current user as assignee option
  const teamMembers = useMemo(() => {
    if (!user) return [];
    return [{ _id: user._id, name: user.name, email: user.email, role: 'Current User' }];
  }, [user]);

  // Helper function to format date for input
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Extract assigneeId - handle both string and object formats
  const getAssigneeId = () => {
    if (!data?.assigneeId) return user?._id || '';
    if (typeof data.assigneeId === 'string') return data.assigneeId;
    return data.assigneeId._id;
  };

  const { control, handleSubmit, formState: { errors }, watch } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      status: data?.status || 'todo',
      priority: data?.priority || 'medium',
      assigneeId: getAssigneeId(),
      dueDate: data?.dueDate ? formatDateForInput(data.dueDate) : '',
    },
  });

  // Watch form values using useMemo to avoid React Compiler warnings
  const watchStatus = watch('status');
  const watchPriority = watch('priority');
  const watchDueDate = watch('dueDate');
  const watchAssigneeId = watch('assigneeId');
  const watchTitle = watch('title');
  const watchDescription = watch('description');

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch(closeModal());
    }
  };

  const onSubmit = async (formData: TaskFormData) => {
    try {
      if (isEditMode && data?._id) {
        // Normalize description - remove empty HTML tags
        const normalizeDescription = (desc: string | undefined): string => {
          if (!desc) return '';
          const textContent = desc.replace(/<[^>]*>/g, '').trim();
          return textContent.length === 0 ? '' : desc;
        };

        // For updates, don't include projectId (it can't be changed)
        // Also ensure description is included even if empty
        const updateData: UpdateTaskData = {
          title: formData.title,
          description: normalizeDescription(formData.description), // Normalize and include description
          status: formData.status,
          priority: formData.priority,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate ? new Date(formData.dueDate as string | Date).toISOString() : null,
          estimatedHours: formData.estimatedHours || null,
          labels: (formData.labels || []).filter((label): label is string => typeof label === 'string' && label.length > 0),
        };
        await updateTask({ id: data._id, updates: updateData }).unwrap();
        toast.success('Task updated successfully!');
      } else {
        // Normalize description - remove empty HTML tags
        const normalizeDescription = (desc: string | undefined): string => {
          if (!desc) return '';
          const textContent = desc.replace(/<[^>]*>/g, '').trim();
          return textContent.length === 0 ? '' : desc;
        };

        // For creation, include projectId - it's required
        if (!data?.projectId) {
          toast.error('Project ID is required to create a task');
          return;
        }
        const createData: CreateTaskData = {
          title: formData.title,
          description: normalizeDescription(formData.description), // Normalize and include description
          status: formData.status,
          priority: formData.priority,
          projectId: data.projectId,
          assigneeId: formData.assigneeId || undefined,
          dueDate: formData.dueDate ? new Date(formData.dueDate as string | Date).toISOString() : undefined,
          estimatedHours: formData.estimatedHours || undefined,
          labels: (formData.labels || []).filter((label): label is string => typeof label === 'string' && label.length > 0),
        };
        await createTask(createData).unwrap();
        toast.success('Task created successfully!');
      }

      handleClose();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as { data?: { message?: string } };
        toast.error(apiError.data?.message || 'Something went wrong!');
      } else {
        toast.error('Something went wrong!');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Helper to format date for display
  const formatDateForDisplay = (dateValue: DueDateValue): string => {
    if (!dateValue) return 'No due date';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Helper to safely convert date for display in preview
  const formatPreviewDate = (dateValue: DueDateValue): string => {
    if (!dateValue) return 'No due date';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (isLoading) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !isLoading) {
            handleClose();
          }
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 id="task-modal-title" className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update task details' : 'Fill in the details to create a new task'}
            </p>
          </div>
          <Tooltip content="Close">
            <button
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Close modal"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <FiX className="w-5 h-5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter task title"
                      className={`input-field pl-4 ${errors.title ? 'input-error' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiAlignLeft className="inline mr-2 w-4 h-4" />
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={(value) => {
                      // Always update the field value - ReactQuill handles the HTML
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    placeholder="Describe the task in detail..."
                    maxLength={10000}
                    disabled={isLoading}
                  />
                )}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                ) : (
                  <p className="text-xs text-gray-500">Optional but recommended</p>
                )}
              </div>
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {(['todo', 'in-progress', 'done'] as const).map((status) => (
                        <Tooltip key={status} content={`Set status to ${status.charAt(0).toUpperCase() + status.slice(1)}`}>
                          <button
                            type="button"
                            onClick={() => field.onChange(status)}
                            disabled={isLoading}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              field.value === status
                                ? `${getStatusColor(status)} border-opacity-100`
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="inline mr-2 w-4 h-4" />
                  Priority *
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => field.onChange(priority)}
                          disabled={isLoading}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            field.value === priority
                              ? `${getPriorityColor(priority)} border-opacity-100`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Assignee & Due Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2 w-4 h-4" />
                  Assign To
                </label>
                <Controller
                  name="assigneeId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ''}
                      className={`input-field ${errors.assigneeId ? 'input-error' : ''}`}
                      disabled={isLoading}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} {member._id === user?._id && '(You)'}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2 w-4 h-4" />
                  Due Date
                </label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => {
                    // Convert Date to string for input value
                    const inputValue = field.value ? new Date(field.value as string | Date).toISOString().split('T')[0] : '';
                    return (
                      <input
                        type="date"
                        className={`input-field ${errors.dueDate ? 'input-error' : ''}`}
                        disabled={isLoading}
                        min={new Date().toISOString().split('T')[0]}
                        value={inputValue}
                        onChange={(e) => {
                          const newValue = e.target.value ? e.target.value : undefined;
                          field.onChange(newValue);
                        }}
                        onBlur={field.onBlur}
                      />
                    );
                  }}
                />
                {watchDueDate && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Selected: </span>
                    <span className="font-medium">
                      {formatDateForDisplay(watchDueDate as DueDateValue)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Task Preview */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {watchTitle || 'Task Title'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(watchStatus || 'todo')}`}>
                      {(watchStatus || 'todo').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(watchPriority || 'medium')}`}>
                      {(watchPriority || 'medium').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div 
                  className="text-sm text-gray-600 mb-3"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(watchDescription || '<span class="text-gray-400 italic">No description provided</span>')
                  }}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <FiUser className="w-3 h-3 mr-1" />
                    <span>
                      {teamMembers.find(m => m._id === watchAssigneeId)?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    <span>
                      {formatPreviewDate(watchDueDate as DueDateValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="btn btn-outline px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary px-6 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-4 h-4 border-2 mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <FiSave className="mr-2" />
                        Update Task
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        Create Task
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;