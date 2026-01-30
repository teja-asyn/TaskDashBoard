import React from 'react';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import Tooltip from '../common/Tooltip';

interface ColumnHeaderProps {
  title: string;
  count: number;
  color: string;
  bgColor: string;
  onAddTask: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  title,
  count,
  color,
  bgColor,
  onAddTask,
}) => {
  const getStatusIcon = () => {
    switch (title) {
      case 'To Do':
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
        );
      case 'In Progress':
        return (
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
        );
      case 'Done':
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${bgColor} border ${color}`}>
      <div className="flex items-center">
        {getStatusIcon()}
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-300">
          {count}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Tooltip content={`Add task to ${title}`}>
          <button
            onClick={onAddTask}
            aria-label={`Add task to ${title} column`}
            className="p-1 text-gray-500 hover:text-primary-600 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <FiPlus className="w-4 h-4" aria-hidden="true" />
          </button>
        </Tooltip>
        <Tooltip content={`More options for ${title}`}>
          <button
            aria-label={`More options for ${title} column`}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <FiMoreVertical className="w-4 h-4" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ColumnHeader;