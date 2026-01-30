import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const ProjectCardSkeleton: React.FC = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
    <div className="h-2 bg-gray-200 rounded mb-4"></div>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export const TaskCardSkeleton: React.FC = () => (
  <div className="task-card animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="flex items-center justify-between">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-24"></div>
  </div>
);

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

