import React from 'react';
import { FiX, FiFolder, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { sanitizeHTML } from '../../utils/sanitize';
import type { Project } from '../../types';
import Tooltip from '../common/Tooltip';

interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
  onEdit?: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, onClose, onEdit }) => {
  const completionPercentage = project.totalTasks > 0 
    ? Math.round((project.taskCounts.done / project.totalTasks) * 100)
    : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success-500';
    if (percentage >= 50) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-details-title"
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
            <h2 id="project-details-title" className="text-xl font-bold text-gray-900 truncate">
              {project.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Project Details
            </p>
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
                <FiFolder className="w-4 h-4 mr-2" />
                Description
              </h3>
              <div 
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(project.description || '<span class="text-gray-400 italic">No description provided</span>')
                }}
              />
            </div>

            {/* Progress Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700">Completion</span>
                    <span className="font-medium text-gray-900">{completionPercentage}%</span>
                  </div>
                  <div 
                    className="w-full bg-gray-200 rounded-full h-3"
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Project progress: ${completionPercentage} percent`}
                  >
                    <div
                      className={`h-3 rounded-full ${getStatusColor(completionPercentage)} transition-all duration-500`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Task Counts */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FiAlertCircle className="w-5 h-5 text-gray-400 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{project.taskCounts.todo}</p>
                    <p className="text-xs text-gray-600">To Do</p>
                  </div>
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FiClock className="w-5 h-5 text-primary-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{project.taskCounts['in-progress']}</p>
                    <p className="text-xs text-gray-600">In Progress</p>
                  </div>
                  <div className="text-center p-3 bg-success-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FiCheckCircle className="w-5 h-5 text-success-600 mr-1" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{project.taskCounts.done}</p>
                    <p className="text-xs text-gray-600">Done</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start">
                <FiCalendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(project.createdAt), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FiFolder className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Tasks</p>
                  <p className="text-sm text-gray-900 font-semibold">{project.totalTasks}</p>
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
              Edit Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;

