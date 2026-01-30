import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import type { Project } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { openModal } from '../../store/slices/uiSlice';
import { useDeleteProjectMutation } from '../../store/api/projectApi';
import Tooltip from '../common/Tooltip';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const completionPercentage = project.totalTasks > 0 
    ? Math.round((project.taskCounts.done / project.totalTasks) * 100)
    : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success-500';
    if (percentage >= 50) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  const handleEdit = () => {
    dispatch(openModal({
      type: 'project',
      data: { ...project, isEditing: true }
    }));
    setIsMenuOpen(false);
  };

  const handleView = () => {
    dispatch(openModal({
      type: 'projectDetails',
      data: {
        project,
        onEdit: () => {
          dispatch(openModal({
            type: 'project',
            data: { ...project, isEditing: true }
          }));
        }
      }
    }));
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    dispatch(openModal({
      type: 'confirm',
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}"? This action cannot be undone and all tasks in this project will be deleted.`,
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: async () => {
          try {
            await deleteProject(project._id).unwrap();
            toast.success('Project deleted successfully');
          } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete project');
          }
        },
      },
    }));
  };

  const menuItems = [
    { icon: FiEye, label: 'View Project', action: handleView },
    { icon: FiEdit2, label: 'Edit Project', action: handleEdit },
    { icon: FiTrash2, label: 'Delete Project', action: handleDelete, danger: true },
  ];

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <Link to={`/projects/${project._id}`} className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                {project.name}
              </h3>
            </Link>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label={`Options menu for ${project.name}`}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <FiMoreVertical className="w-5 h-5" aria-hidden="true" />
                </button>
                
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div 
                      role="menu"
                      aria-label="Project options"
                      className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-modal border border-gray-200 z-20 py-1"
                    >
                      {menuItems.map((item) => (
                        <button
                          key={item.label}
                          role="menuitem"
                          onClick={() => {
                            item.action();
                            setIsMenuOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsMenuOpen(false);
                            }
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset ${
                            item.danger
                              ? 'text-danger-600 hover:bg-danger-50'
                              : 'text-gray-700 hover:bg-gray-100'
                          } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={isDeleting && item.danger}
                        >
                          <item.icon className="mr-3 w-4 h-4" aria-hidden="true" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-w-0">
            {project.description || 'No description provided'}
          </p>
          
          <div className="text-xs text-gray-500 mb-4">
            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700">Progress</span>
          <span className="font-medium text-gray-900" aria-label={`${completionPercentage} percent complete`}>
            {completionPercentage}%
          </span>
        </div>
        <div 
          className="w-full bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Project progress: ${completionPercentage} percent`}
        >
          <div
            className={`h-2 rounded-full ${getStatusColor(completionPercentage)} transition-all duration-500`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Task Counts */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
            <span className="text-gray-600">Todo: {project.taskCounts.todo}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            <span className="text-gray-600">In Progress: {project.taskCounts['in-progress']}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <span className="text-gray-600">Done: {project.taskCounts.done}</span>
          </div>
        </div>
        <div className="text-gray-900 font-medium">
          {project.totalTasks} tasks
        </div>
      </div>

      {/* Action Buttons */}
        <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-100">
          <Tooltip content={`View ${project.name} details`}>
            <Link
              to={`/projects/${project._id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View Project →
            </Link>
          </Tooltip>
        </div>
    </div>
  );
};

export default ProjectCard;