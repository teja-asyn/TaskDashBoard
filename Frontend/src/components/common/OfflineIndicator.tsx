import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi, FiX } from 'react-icons/fi';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Hide banner after 3 seconds when coming back online
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also check periodically (in case events don't fire)
    const interval = setInterval(() => {
      const online = navigator.onLine;
      if (online !== isOnline) {
        setIsOnline(online);
        setShowBanner(true);
        if (online) {
          setTimeout(() => setShowBanner(false), 3000);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  // Don't show banner if online and user hasn't seen it
  if (!showBanner) return null;

  // Don't allow closing when offline
  const canClose = isOnline;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`flex items-center justify-center gap-3 px-4 py-3 sm:py-4 text-sm sm:text-base font-medium shadow-lg relative ${
          isOnline
            ? 'bg-success-600 text-white'
            : 'bg-danger-600 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <FiWifi className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span>Internet connection restored</span>
          </>
        ) : (
          <>
            <FiWifiOff className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 animate-pulse" />
            <span>No internet connection available</span>
          </>
        )}
        {canClose && (
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

