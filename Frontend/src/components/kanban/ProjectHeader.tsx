import React from 'react';
import { FiChevronLeft, FiMoreVertical, FiUsers, FiCalendar, FiTag, FiEdit2, FiSettings } from 'react-icons/fi';
import { format } from 'date-fns';

interface ProjectHeaderProps {
  project: {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    taskCounts: {
      todo: number;
      'in-progress': number;
      done: number;
    };
    totalTasks: number;
    teamMembers?: Array<{ _id: string; name: string; role: string }>;
  };
  onBack: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { icon: FiEdit2, label: 'Edit Project', action: () => {} },
    { icon: FiSettings, label: 'Project Settings', action: () => {} },
    { icon: FiUsers, label: 'Manage Team', action: () => {} },
    { label: 'divider' },
    { icon: FiTag, label: 'Archive Project', action: () => {}, danger: true },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left Side - Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start mb-2">
              <button
                onClick={onBack}
                aria-label="Back to dashboard"
                className="mr-2 sm:mr-3 p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{project.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">{project.description}</p>
              </div>
            </div>

            {/* Project Stats */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Created {format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
              {project.teamMembers && project.teamMembers.length > 0 && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">{project.teamMembers.length} team members</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">To Do: {project.taskCounts.todo}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">In Progress: {project.taskCounts['in-progress']}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Done: {project.taskCounts.done}</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                  {project.totalTasks} total tasks
                </div>
              </div>
            </div>

            {/* Team Avatars */}
            {project.teamMembers && project.teamMembers.length > 0 && (
              <div className="flex items-center mt-3 sm:mt-4">
                <div className="flex -space-x-2">
                  {project.teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="relative"
                      title={`${member.name} (${member.role})`}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-full border-2 border-white flex items-center justify-center hover:z-10 transition-transform hover:scale-110">
                        <span className="text-primary-700 text-xs font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="ml-3 sm:ml-4 text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                  + Invite more
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center justify-end lg:justify-start gap-2 sm:gap-3 flex-shrink-0">
            {/* Progress Circle */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeDasharray={`${(project.taskCounts.done / project.totalTasks) * 100}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm sm:text-lg font-bold text-gray-900">
                    {Math.round((project.taskCounts.done / project.totalTasks) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Project options menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-modal border border-gray-200 z-20 py-1">
                    {menuItems.map((item, index) => (
                      item.label === 'divider' ? (
                        <div key={index} className="border-t border-gray-200 my-1" />
                      ) : (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.action?.();
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm ${
                            item.danger
                              ? 'text-danger-600 hover:bg-danger-50'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon && <item.icon className="mr-3 w-4 h-4" />}
                          {item.label}
                        </button>
                      )
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;