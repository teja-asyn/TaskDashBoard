import React from 'react';
import { FiX, FiUser, FiCalendar, FiTag, FiFolder } from 'react-icons/fi';
import { format } from 'date-fns';
import { sanitizeHTML } from '../../utils/sanitize';
import type { Task } from '../../types';
import Tooltip from '../common/Tooltip';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit?: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onEdit }) => {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'medium':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'low':
        return 'bg-success-100 text-success-700 border-success-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'in-progress':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'done':
        return 'bg-success-100 text-success-700 border-success-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-danger-600' };
    if (diffDays <= 2) return { text: 'Due soon', color: 'text-warning-600' };
    return null;
  };

  const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId?._id;
  const projectName = typeof task.projectId === 'string' ? 'Project' : task.projectId?.name;

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-details-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 id="task-details-title" className="text-xl font-bold text-gray-900 truncate">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
          </div>
          <Tooltip content="Close">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ml-4 flex-shrink-0"
            >
              <FiX className="w-5 h-5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FiTag className="w-4 h-4 mr-2" />
                Description
              </h3>
              <div 
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(task.description || '<span class="text-gray-400 italic">No description provided</span>')
                }}
              />
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project */}
              {projectId && (
                <div className="flex items-start">
                  <FiFolder className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Project</p>
                    <p className="text-sm text-gray-900 truncate">{projectName}</p>
                  </div>
                </div>
              )}

              {/* Assignee */}
              <div className="flex items-start">
                <FiUser className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assignee</p>
                  <p className="text-sm text-gray-900">
                    {task.assigneeId ? (
                      typeof task.assigneeId === 'string' ? 'Assigned' : task.assigneeId.name
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-start">
                <FiCalendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
                  {task.dueDate ? (
                    <div>
                      <p className="text-sm text-gray-900">
                        {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                      </p>
                      {getDueDateStatus() && (
                        <p className={`text-xs font-medium mt-1 ${getDueDateStatus()?.color}`}>
                          {getDueDateStatus()?.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No due date</p>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start">
                <FiCalendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(task.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline px-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn btn-primary px-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Edit Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;

