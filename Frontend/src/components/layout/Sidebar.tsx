import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiGrid, 
  FiFolder, 
  FiUsers, 
  FiSettings,
  FiPlus,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { openModal } from '../../store/slices/uiSlice';
import Tooltip from '../common/Tooltip';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui) as { sidebarOpen: boolean };

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/projects', icon: FiGrid, label: 'Projects' },
    { to: '/tasks', icon: FiFolder, label: 'My Tasks' },
    { to: '/team', icon: FiUsers, label: 'Team' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/reports', icon: FiBarChart2, label: 'Reports' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const handleCreateProject = () => {
    dispatch(openModal({ type: 'project' }));
  };

  return (
    <aside className={`hidden md:block ${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transition-all duration-300`}>
      <div className="p-4">
        {/* Create Project Button */}
        <Tooltip content="Create new project" disabled={sidebarOpen}>
          <button
            onClick={handleCreateProject}
            aria-label={sidebarOpen ? "Create new project" : "New Project"}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <FiPlus className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {sidebarOpen && <span>New Project</span>}
          </button>
        </Tooltip>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item) => (
            <Tooltip key={item.to} content={item.label} disabled={sidebarOpen} position="right">
              <NavLink
                to={item.to}
                aria-label={sidebarOpen ? item.label : `${item.label} page`}
                className={({ isActive }) =>
                  `flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} aria-hidden="true" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        {/* Recent Projects */}
        {sidebarOpen && (
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Projects
            </h3>
            <div className="space-y-1">
              {['Website Redesign', 'Mobile App', 'Marketing Campaign'].map((project) => (
                <button
                  key={project}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  {project}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;