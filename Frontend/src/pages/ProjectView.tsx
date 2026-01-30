import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  FiPlus,
  FiFilter,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiColumns,
  FiAlertCircle,
  FiX
} from 'react-icons/fi';
import { format } from 'date-fns';
import { openModal } from '../store/slices/uiSlice';
import TaskCard from '../components/kanban/TaskCard';
import ColumnHeader from '../components/kanban/ColumnHeader';
import ProjectHeader from '../components/kanban/ProjectHeader';
import { useGetProjectQuery, useGetProjectTasksQuery } from '../store/api/projectApi';
import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from '../store/api/taskApi';
import { toast } from 'react-hot-toast';
import { sanitizeHTML } from '../utils/sanitize';
import type { Task } from '../types';
import Tooltip from '../components/common/Tooltip';

const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Fetch project data - skip if no token or projectId
  const { data: project, isLoading: projectLoading, error: projectError } = useGetProjectQuery(projectId || '', {
    skip: !projectId || !token,
  });

  // Fetch tasks with filters - skip if no token or projectId
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useGetProjectTasksQuery(
    {
      projectId: projectId || '',
      status: filterStatus !== 'all' ? filterStatus : undefined,
      priority: filterPriority !== 'all' ? filterPriority : undefined,
      assignee: filterAssignee !== 'all' ? filterAssignee : undefined,
      search: searchTerm || undefined,
    },
    { skip: !projectId || !token }
  );

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasks: Task[] = tasksData?.tasks || [];

  // Derive filteredTasks from current state using useMemo to avoid effect-based state updates
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task => task.assigneeId?._id === filterAssignee);
    }

    return filtered;
  }, [searchTerm, filterStatus, filterPriority, filterAssignee, tasks]);

  // Organize tasks by status for Kanban columns
  const columns = {
    todo: {
      id: 'todo',
      title: 'To Do',
      tasks: filteredTasks.filter(task => task.status === 'todo'),
      color: 'border-gray-300',
      bgColor: 'bg-gray-50',
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      tasks: filteredTasks.filter(task => task.status === 'in-progress'),
      color: 'border-blue-300',
      bgColor: 'bg-blue-50',
    },
    done: {
      id: 'done',
      title: 'Done',
      tasks: filteredTasks.filter(task => task.status === 'done'),
      color: 'border-green-300',
      bgColor: 'bg-green-50',
    },
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task being dragged
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    // Update task status based on destination column
    const newStatus = destination.droppableId as 'todo' | 'in-progress' | 'done';
    
    try {
      await updateTaskStatus({ id: draggableId, status: newStatus }).unwrap();
      toast.success('Task status updated');
      refetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = () => {
    if (!project) return;
    dispatch(openModal({
      type: 'task',
      data: { projectId: project._id }
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
            refetchTasks();
          } catch (error) {
            toast.error('Failed to delete task');
            console.error('Error deleting task:', error);
          }
        },
      },
    }));
  };

  const getStatusCount = (status: string) => {
    return filteredTasks.filter(task => task.status === status).length;
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 sm:h-20 bg-white border-b border-gray-200 animate-pulse"></div>
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-48 sm:w-64 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 sm:space-y-4">
                <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"></div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-24 sm:h-32 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Project not found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button className="btn btn-primary text-sm sm:text-base" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <ProjectHeader project={project} onBack={() => navigate('/dashboard')} />

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
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
                  placeholder="Search tasks... (Ctrl+K)"
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
                  {Array.from(new Set(tasks.map(t => t.assigneeId?._id).filter(Boolean))).map(assigneeId => {
                    const assignee = tasks.find(t => t.assigneeId?._id === assigneeId)?.assigneeId;
                    return assignee ? (
                      <option key={assigneeId} value={assigneeId}>
                        {assignee.name}
                      </option>
                    ) : null;
                  })}
                </select>

                <Tooltip content="More filter options">
                  <button 
                    aria-label="More filter options"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <FiFilter className="w-5 h-5" aria-hidden="true" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Right Side - Actions & View Toggle */}
            <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-3 flex-shrink-0">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1" role="group" aria-label="View mode toggle">
                <Tooltip content="Board view">
                  <button
                    onClick={() => setViewMode('board')}
                    aria-label="Switch to board view"
                    aria-pressed={viewMode === 'board'}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      viewMode === 'board'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    <span className="sr-only">Board View</span>
                  </button>
                </Tooltip>
                <Tooltip content="List view">
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="Switch to list view"
                    aria-pressed={viewMode === 'list'}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiList className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    <span className="sr-only">List View</span>
                  </button>
                </Tooltip>
              </div>

              {/* Action Buttons */}
              <Tooltip content="Refresh tasks">
                <button 
                  onClick={() => refetchTasks()}
                  aria-label="Refresh tasks"
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
              </Tooltip>

              {/* Add Task Button */}
              <Tooltip content="Create a new task">
                <button
                  onClick={handleCreateTask}
                  aria-label="Create new task"
                  className="btn btn-primary flex items-center text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <FiPlus className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {viewMode === 'board' ? (
          // Kanban Board View
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6" role="group" aria-label="Kanban board columns">
              {Object.values(columns).map((column) => (
                <div
                  key={column.id}
                  className="flex flex-col h-full"
                  role="region"
                  aria-label={`${column.title} column`}
                >
                  <ColumnHeader
                    title={column.title}
                    count={column.tasks.length}
                    color={column.color}
                    bgColor={column.bgColor}
                    onAddTask={() => {
                      dispatch(openModal({
                        type: 'task',
                        data: { projectId: project._id, status: column.id }
                      }));
                    }}
                  />
                  
                  <Droppable droppableId={column.id}>
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        role="list"
                        aria-label={`${column.title} tasks`}
                        aria-live="polite"
                        className={`flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] p-3 sm:p-4 rounded-lg border-2 ${column.color} ${
                          snapshot.isDraggingOver ? 'bg-opacity-50' : ''
                        } ${column.bgColor} transition-colors duration-200`}
                      >
                        {column.tasks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                            <FiColumns className="w-12 h-12 mb-3 opacity-50" />
                            <p className="text-sm">No tasks in this column</p>
                            <Tooltip content={`Add a new task to ${column.title}`}>
                              <button
                                onClick={() => {
                                  dispatch(openModal({
                                    type: 'task',
                                    data: { projectId: project._id, status: column.id }
                                  }));
                                }}
                                aria-label={`Add task to ${column.title} column`}
                                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded px-2 py-1"
                              >
                                + Add a task
                              </button>
                            </Tooltip>
                          </div>
                        ) : (
                          column.tasks.map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  role="listitem"
                                  aria-label={`Task: ${task.title}, ${task.priority} priority, ${task.status} status`}
                                  className={`mb-3 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={() => handleEditTask(task)}
                                    onDelete={() => handleDeleteTask(task._id)}
                                    searchTerm={searchTerm}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          // List View
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Priority
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Assignee
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Due Date
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        <div className="min-w-0 max-w-xs sm:max-w-md lg:max-w-lg">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                            {task.title}
                          </div>
                          <div 
                            className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHTML(task.description || '<span class="text-gray-400 italic">No description</span>')
                            }}
                          />
                          {/* Mobile: Show status and priority badges */}
                          <div className="flex items-center gap-2 mt-2 sm:hidden">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                              task.status === 'todo' ? 'status-badge-todo' :
                              task.status === 'in-progress' ? 'status-badge-in-progress' :
                              'status-badge-done'
                            }`}>
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                              task.priority === 'low' ? 'priority-badge-low' :
                              task.priority === 'medium' ? 'priority-badge-medium' :
                              'priority-badge-high'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'todo' ? 'status-badge-todo' :
                          task.status === 'in-progress' ? 'status-badge-in-progress' :
                          'status-badge-done'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'low' ? 'priority-badge-low' :
                          task.priority === 'medium' ? 'priority-badge-medium' :
                          'priority-badge-high'
                        }`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                        {task.assigneeId ? (
                          <div className="flex items-center min-w-0">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                              <span className="text-primary-700 text-xs font-medium">
                                {task.assigneeId.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[120px] sm:max-w-none">
                              {task.assigneeId.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell">
                        {task.dueDate ? (
                          <div className="text-xs sm:text-sm text-gray-900">
                            <div className="whitespace-nowrap">{format(new Date(task.dueDate), 'MMM d, yyyy')}</div>
                            {new Date(task.dueDate) < new Date() && (
                              <span className="text-xs text-danger-600 font-medium">
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">No due date</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2 justify-start">
                          <Tooltip content="View task details">
                            <button
                              onClick={() => {
                                dispatch(openModal({
                                  type: 'taskDetails',
                                  data: {
                                    task,
                                    onEdit: () => handleEditTask(task)
                                  }
                                }));
                              }}
                              aria-label="View task details"
                              className="p-1.5 sm:p-1 text-gray-400 hover:text-primary-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Edit task">
                            <button
                              onClick={() => handleEditTask(task)}
                              aria-label="Edit task"
                              className="p-1.5 sm:p-1 text-gray-400 hover:text-primary-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete task">
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              aria-label="Delete task"
                              className="p-1.5 sm:p-1 text-gray-400 hover:text-danger-600 rounded focus:outline-none focus:ring-2 focus:ring-danger-500 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
            <FiColumns className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first task for this project.'}
            </p>
            <Tooltip content="Create your first task for this project">
              <button
                onClick={handleCreateTask}
                className="btn btn-primary inline-flex items-center text-sm sm:text-base"
              >
                <FiPlus className="mr-2" />
                Create First Task
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;