import React from 'react';
import { FiLoader, FiCheck, FiZap, FiServer } from 'react-icons/fi';

interface LoginLoaderProps {
  message?: string;
  stage?: 'connecting' | 'authenticating' | 'loading' | 'success';
}

const LoginLoader: React.FC<LoginLoaderProps> = ({ 
  message, 
  stage = 'connecting' 
}) => {
  const [dots, setDots] = React.useState('');
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const getStageConfig = () => {
    switch (stage) {
      case 'connecting':
        return {
          icon: <FiServer className="w-6 h-6 text-primary-600" />,
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
          messages: [
            'Waking up the server',
            'Establishing connection',
            'Almost there',
          ],
        };
      case 'authenticating':
        return {
          icon: <FiZap className="w-6 h-6 text-warning-600" />,
          color: 'text-warning-600',
          bgColor: 'bg-warning-50',
          messages: [
            'Verifying credentials',
            'Authenticating your account',
            'Securing your session',
          ],
        };
      case 'loading':
        return {
          icon: <FiLoader className="w-6 h-6 text-primary-600 animate-spin" />,
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
          messages: [
            'Loading your workspace',
            'Preparing your dashboard',
            'Almost ready',
          ],
        };
      case 'success':
        return {
          icon: <FiCheck className="w-6 h-6 text-success-600" />,
          color: 'text-success-600',
          bgColor: 'bg-success-50',
          messages: ['Welcome back!'],
        };
      default:
        return {
          icon: <FiLoader className="w-6 h-6 text-primary-600 animate-spin" />,
          color: 'text-primary-600',
          bgColor: 'bg-primary-50',
          messages: ['Loading...'],
        };
    }
  };

  const config = getStageConfig();
  const displayMessage = message || config.messages[0];

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-6">
      {/* Animated Icon Container */}
      <div className={`relative ${config.bgColor} rounded-full p-4`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 animate-pulse"></div>
        <div className="relative">
          {config.icon}
        </div>
        
        {/* Rotating Ring */}
        {stage !== 'success' && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
        )}
      </div>

      {/* Message with animated dots */}
      <div className="text-center">
        <p className={`text-sm font-medium ${config.color} mb-1`}>
          {displayMessage}
          {stage !== 'success' && <span className="inline-block w-4">{dots}</span>}
        </p>
        {stage === 'connecting' && (
          <p className="text-xs text-gray-500 mt-2">
            This may take a moment on first request
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {stage !== 'success' && (
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.bgColor} rounded-full transition-all duration-500 ${
              stage === 'connecting' ? 'w-1/3' :
              stage === 'authenticating' ? 'w-2/3' :
              'w-full'
            }`}
            style={{
              background: `linear-gradient(90deg, ${stage === 'connecting' ? '#3b82f6' : stage === 'authenticating' ? '#f59e0b' : '#10b981'} 0%, ${stage === 'connecting' ? '#60a5fa' : stage === 'authenticating' ? '#fbbf24' : '#34d399'} 100%)`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LoginLoader;

