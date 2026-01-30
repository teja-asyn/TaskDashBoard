import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '../store/slices/uiSlice';
import { 
  FiPlus, 
  FiFolder, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle,
  FiTrendingUp
} from 'react-icons/fi';
import type { RootState } from '../store/store';
import ProjectCard from '../components/dashboard/ProjectCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { ProjectCardSkeleton, StatCardSkeleton } from '../components/common/LoadingSkeleton';
import { useGetProjectsQuery } from '../store/api/projectApi';
import Tooltip from '../components/common/Tooltip';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  // Skip query if no token to prevent showing stale data
  const { data: projects = [], isLoading, error } = useGetProjectsQuery(undefined, {
    skip: !token,
  });

  const totalTasks = projects.reduce((sum, project) => sum + project.totalTasks, 0);
  const completedTasks = projects.reduce((sum, project) => sum + project.taskCounts.done, 0);
  const inProgressTasks = projects.reduce((sum, project) => sum + project.taskCounts['in-progress'], 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = {
    totalProjects: projects.length,
    totalTasks,
    completedTasks,
    inProgressTasks,
    completionRate,
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProjectCardSkeleton key={i} />
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-6">Please try again later</p>
          <button 
            className="btn btn-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" 
            onClick={() => window.location.reload()}
            aria-label="Retry loading dashboard"
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
          </div>
          <Tooltip content="Create a new project">
            <button 
              onClick={() => dispatch(openModal({ type: 'project' }))}
              aria-label="Create new project"
              className="btn btn-primary flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <FiPlus className="mr-2" aria-hidden="true" />
              New Project
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiFolder className="w-6 h-6 text-primary-600" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProjects}</h3>
          <p className="text-gray-600 text-sm">Total Projects</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-50 rounded-lg">
              <FiClock className="w-6 h-6 text-warning-600" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTasks}</h3>
          <p className="text-gray-600 text-sm">Total Tasks</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-50 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.completedTasks}</h3>
          <p className="text-gray-600 text-sm">Completed Tasks</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-danger-50 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-danger-600" />
            </div>
            <FiTrendingUp className="w-5 h-5 text-danger-600 rotate-90" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.inProgressTasks}</h3>
          <p className="text-gray-600 text-sm">In Progress</p>
        </div>
      </div>

      {/* Completion Rate Card */}
      {totalTasks > 0 && (
        <div className="mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-2xl font-bold text-primary-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
              <span>{completedTasks} of {totalTasks} tasks completed</span>
              <span>{totalTasks - completedTasks} remaining</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Projects */}
        <div className="lg:col-span-2">
          <div className="section-header">
            <div>
              <h2 className="section-title">Your Projects</h2>
              <p className="text-gray-600">Manage and track all your projects</p>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="card p-12 text-center">
              <FiFolder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started</p>
              <Tooltip content="Create your first project">
                <button 
                  onClick={() => dispatch(openModal({ type: 'project' }))}
                  className="btn btn-primary inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Create Project
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;