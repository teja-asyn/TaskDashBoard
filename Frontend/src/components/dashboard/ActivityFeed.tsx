import React from 'react';
import { FiCheckCircle, FiPlus, FiEdit2, FiMessageSquare, FiUserPlus, FiUpload } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
    color: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: 'completed' | 'created' | 'updated' | 'commented' | 'assigned';
}

const ActivityFeed: React.FC = () => {
  // TODO: Fetch activities from backend API when available
  const activities: Activity[] = [];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-success-500" />;
      case 'created':
        return <FiPlus className="w-4 h-4 text-primary-500" />;
      case 'updated':
        return <FiEdit2 className="w-4 h-4 text-warning-500" />;
      case 'commented':
        return <FiMessageSquare className="w-4 h-4 text-blue-500" />;
      case 'assigned':
        return <FiUserPlus className="w-4 h-4 text-purple-500" />;
      default:
        return <FiUpload className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'completed':
        return 'bg-success-50 border-success-100';
      case 'created':
        return 'bg-primary-50 border-primary-100';
      case 'updated':
        return 'bg-warning-50 border-warning-100';
      case 'commented':
        return 'bg-blue-50 border-blue-100';
      case 'assigned':
        return 'bg-purple-50 border-purple-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Activity feed will appear here</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start p-3 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`w-8 h-8 rounded-full ${activity.user.color} flex items-center justify-center`}>
                  <span className="text-white text-xs font-medium">
                    {activity.user.avatar}
                  </span>
                </div>
              </div>
              
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center">
                  {getActivityIcon(activity.type)}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {activity.user.name}
                  </span>
                  <span className="mx-1 text-sm text-gray-600">{activity.action}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {activity.target}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs font-medium">+</span>
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add a comment or update..."
              className="w-full input-field text-sm"
            />
          </div>
          <button className="btn btn-primary text-sm px-4">
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;