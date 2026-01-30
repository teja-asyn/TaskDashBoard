import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiAlertCircle,
  FiX,
  FiFolder,
  FiCalendar,
  FiUser,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { openModal } from '../store/slices/uiSlice';
import { useGetAllTasksQuery, useDeleteTaskMutation } from '../store/api/taskApi';
import { toast } from 'react-hot-toast';
import { sanitizeHTML } from '../utils/sanitize';
import type { RootState } from '../store/store';
import type { Task } from '../types';
import Tooltip from '../components/common/Tooltip';

const Tasks: React.FC = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Fetch all tasks with filters
  const { data: tasksData, isLoading, error, refetch } = useGetAllTasksQuery(
    {
      status: filterStatus !== 'all' ? filterStatus : undefined,
      priority: filterPriority !== 'all' ? filterPriority : undefined,
      assignee: filterAssignee !== 'all' ? filterAssignee : undefined,
      search: searchTerm || undefined,
    },
    { skip: !token }
  );

  const [deleteTask] = useDeleteTaskMutation();

  const tasks: Task[] = tasksData?.tasks || [];

  // Get unique assignees and projects for filters
  const assignees = useMemo(() => {
    const assigneeSet = new Set<string>();
    tasks.forEach(task => {
      if (task.assigneeId?._id) {
        assigneeSet.add(task.assigneeId._id);
      }
    });
    return Array.from(assigneeSet).map(id => {
      const task = tasks.find(t => t.assigneeId?._id === id);
      return task?.assigneeId;
    }).filter(Boolean);
  }, [tasks]);

  const getStatusCount = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };

  const handleViewTask = (task: Task) => {
    dispatch(openModal({
      type: 'taskDetails',
      data: {
        task,
        onEdit: () => {
          dispatch(openModal({ type: 'task', data: { ...task, isEditing: true } }));
        }
      }
    }));
  };

  const handleEditTask = (task: Task) => {
    dispatch(openModal({
      type: 'task',
      data: { ...task, isEditing: true }
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    dispatch(openModal({
      type: 'confirm',
      data: {
        title: 'Delete Task',
        message: task 
          ? `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
          : 'Are you sure you want to delete this task? This action cannot be undone.',
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: async () => {
          try {
            await deleteTask(taskId).unwrap();
            toast.success('Task deleted successfully');
            refetch();
          } catch (error) {
            toast.error('Failed to delete task');
            console.error('Error deleting task:', error);
          }
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <FiAlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load tasks</h3>
          <p className="text-gray-600 mb-6">Please try again later</p>
          <button 
            className="btn btn-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" 
            onClick={() => refetch()}
            aria-label="Retry loading tasks"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">View and manage all your tasks across all projects</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Left Side - Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <label htmlFor="task-search" className="sr-only">
                Search tasks
              </label>
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="task-search"
                type="search"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search tasks"
                className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                >
                  <FiX className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 min-w-0" role="group" aria-label="Task filters">
              <label htmlFor="filter-status" className="sr-only">
                Filter by status
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter tasks by status"
                className="px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0 flex-shrink"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do ({getStatusCount('todo')})</option>
                <option value="in-progress">In Progress ({getStatusCount('in-progress')})</option>
                <option value="done">Done ({getStatusCount('done')})</option>
              </select>

              <label htmlFor="filter-priority" className="sr-only">
                Filter by priority
              </label>
              <select
                id="filter-priority"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                aria-label="Filter tasks by priority"
                className="px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0 flex-shrink"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <label htmlFor="filter-assignee" className="sr-only">
                Filter by assignee
              </label>
              <select
                id="filter-assignee"
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                aria-label="Filter tasks by assignee"
                className="px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0 flex-shrink"
              >
                <option value="all">All Assignees</option>
                {assignees.map((assignee) => (
                  assignee && (
                    <option key={assignee._id} value={assignee._id}>
                      {assignee.name}
                    </option>
                  )
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks available</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all'
              ? 'No tasks match your current filters. Try adjusting your search or filters.'
              : 'You don\'t have any tasks yet. Create a task in a project to get started.'}
          </p>
          {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterAssignee('all');
              }}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left Side - Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleViewTask(task)}
                        className="text-lg font-semibold text-gray-900 mb-2 break-words text-left hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                      >
                        {task.title}
                      </button>
                      <div 
                        className="text-sm text-gray-600 line-clamp-3 mb-3"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHTML(task.description || '<span class="text-gray-400 italic">No description provided</span>')
                        }}
                      />
                      {task.description && task.description.length > 150 && (
                        <button
                          onClick={() => handleViewTask(task)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
                        >
                          Read more...
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task Meta */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                    {/* Project */}
                    {task.projectId && (
                      <Link
                        to={`/projects/${typeof task.projectId === 'string' ? task.projectId : task.projectId._id}`}
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <FiFolder className="w-4 h-4 mr-1" />
                        <span className="truncate max-w-[150px]">
                          {typeof task.projectId === 'string' ? 'Project' : task.projectId.name}
                        </span>
                      </Link>
                    )}

                    {/* Status */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'todo' ? 'status-badge-todo' :
                      task.status === 'in-progress' ? 'status-badge-in-progress' :
                      'status-badge-done'
                    }`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>

                    {/* Priority */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'low' ? 'priority-badge-low' :
                      task.priority === 'medium' ? 'priority-badge-medium' :
                      'priority-badge-high'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>

                    {/* Assignee */}
                    {task.assigneeId ? (
                      <div className="flex items-center text-gray-600">
                        <FiUser className="w-4 h-4 mr-1" />
                        <span className="truncate max-w-[120px]">
                          {task.assigneeId.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <FiUser className="w-4 h-4 mr-1" />
                        <span>Unassigned</span>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className={`flex items-center ${
                        new Date(task.dueDate) < new Date() ? 'text-danger-600' : 'text-gray-600'
                      }`}>
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        {new Date(task.dueDate) < new Date() && (
                          <span className="ml-2 text-xs font-medium">Overdue</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <Tooltip content="View task details">
                    <button
                      onClick={() => handleViewTask(task)}
                      aria-label="View task details"
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Edit task">
                    <button
                      onClick={() => handleEditTask(task)}
                      aria-label="Edit task"
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Delete task">
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      aria-label="Delete task"
                      className="p-2 text-gray-400 hover:text-danger-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-danger-500 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </Tooltip>
                  {task.projectId && (
                    <Tooltip content={`View ${typeof task.projectId === 'string' ? 'project' : task.projectId.name}`}>
                      <Link
                        to={`/projects/${typeof task.projectId === 'string' ? task.projectId : task.projectId._id}`}
                        aria-label="View project"
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      >
                        <FiFolder className="w-5 h-5" />
                      </Link>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;

