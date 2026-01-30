import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { closeModal } from '../../store/slices/uiSlice';

interface ConfirmModalProps {
  data?: {
    title?: string;
    message?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  onClose?: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ data, onClose }) => {
  const dispatch = useDispatch();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management and keyboard navigation
  useEffect(() => {
    // Focus the cancel button by default
    cancelButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch(closeModal());
    }
  };

  const handleConfirm = () => {
    if (data?.onConfirm) {
      data.onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (data?.onCancel) {
      data.onCancel();
    }
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const getIcon = () => {
    switch (data?.type) {
      case 'danger':
        return <FiAlertTriangle className="w-12 h-12 text-danger-600" />;
      case 'warning':
        return <FiAlertTriangle className="w-12 h-12 text-warning-600" />;
      case 'success':
        return <FiCheckCircle className="w-12 h-12 text-success-600" />;
      case 'info':
        return <FiInfo className="w-12 h-12 text-primary-600" />;
      default:
        return <FiHelpCircle className="w-12 h-12 text-gray-600" />;
    }
  };

  const getButtonClass = () => {
    switch (data?.type) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'success':
        return 'btn-success';
      case 'info':
        return 'btn-primary';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div 
        className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-slide-up mx-4"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClose();
          }
        }}
      >
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4" aria-hidden="true">
            {getIcon()}
          </div>

          {/* Title */}
          {data?.title && (
            <h3 id="confirm-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3">
              {data.title}
            </h3>
          )}

          {/* Message */}
          {data?.message && (
            <p id="confirm-modal-message" className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              {data.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 pt-4">
            <button
              ref={cancelButtonRef}
              onClick={handleCancel}
              onKeyDown={(e) => handleKeyDown(e, handleCancel)}
              aria-label={data?.cancelText || 'Cancel'}
              className="btn btn-outline px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base min-w-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {data?.cancelText || 'Cancel'}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              onKeyDown={(e) => handleKeyDown(e, handleConfirm)}
              aria-label={data?.confirmText || 'Confirm'}
              className={`btn px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base min-w-[100px] focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClass()}`}
            >
              {data?.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;