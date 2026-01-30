import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiUser, FiCalendar, FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import { highlightSearchTermHTML } from '../../utils/searchHighlight';
import { sanitizeHTML } from '../../utils/sanitize';
import { openModal } from '../../store/slices/uiSlice';
import type { Task } from '../../types';
import Tooltip from '../common/Tooltip';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  searchTerm?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, searchTerm = '' }) => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleView = () => {
    dispatch(openModal({
      type: 'taskDetails',
      data: {
        task,
        onEdit: () => {
          dispatch(openModal({ type: 'task', data: { ...task, isEditing: true } }));
        }
      }
    }));
    setIsMenuOpen(false);
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-danger-500';
      case 'medium':
        return 'bg-warning-500';
      case 'low':
        return 'bg-success-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDueDateColor = () => {
    if (!task.dueDate) return 'text-gray-500';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-danger-600';
    if (diffDays <= 2) return 'text-warning-600';
    return 'text-gray-600';
  };

  const menuItems = [
    { icon: FiEye, label: 'View Task', action: handleView },
    { icon: FiEdit2, label: 'Edit Task', action: onEdit },
    { icon: FiTrash2, label: 'Delete Task', action: onDelete, danger: true },
  ];

  return (
    <div className="task-card group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} task: ${task.title}`}
              className="font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(searchTerm ? highlightSearchTermHTML(task.title, searchTerm) : task.title)
              }}
            />
            <div className="flex items-center space-x-1">
              <div 
                className={`w-3 h-3 rounded-full ${getPriorityColor()}`} 
                title={`${task.priority} priority`}
                aria-label={`Priority: ${task.priority}`}
                role="img"
              />
              <div className="relative">
                <Tooltip content={`Options for ${task.title}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    aria-label={`Options menu for task: ${task.title}`}
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                    className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:opacity-100"
                  >
                    <FiMoreVertical className="w-4 h-4" aria-hidden="true" />
                  </button>
                </Tooltip>
                
                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div 
                      role="menu"
                      aria-label="Task options"
                      className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-modal border border-gray-200 z-20 py-1"
                    >
                      {menuItems.map((item) => (
                        <button
                          key={item.label}
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation();
                            item.action();
                            setIsMenuOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsMenuOpen(false);
                            }
                          }}
                          className={`flex items-center w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset ${
                            item.danger
                              ? 'text-danger-600 hover:bg-danger-50'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="mr-2 w-4 h-4" aria-hidden="true" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} task description`}
            className={`text-sm text-gray-600 mb-3 cursor-pointer transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(task.description || '<span class="text-gray-400 italic">No description</span>')
            }}
          />
        </div>
      </div>

      {/* Task Meta */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          {task.assigneeId ? (
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                <FiUser className="w-3 h-3 text-primary-600" />
              </div>
              <span className="text-gray-700">{task.assigneeId.name}</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400">
              <FiUser className="w-4 h-4 mr-1" />
              <span>Unassigned</span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center ${getDueDateColor()}`}>
              <FiCalendar className="w-4 h-4 mr-1" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}

        </div>

        {/* Status Badge */}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          task.status === 'todo' ? 'status-badge-todo' :
          task.status === 'in-progress' ? 'status-badge-in-progress' :
          'status-badge-done'
        }`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>

    </div>
  );
};

export default TaskCard;