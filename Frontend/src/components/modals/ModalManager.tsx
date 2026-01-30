import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { closeModal } from '../../store/slices/uiSlice';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import ConfirmModal from './ConfirmModal';
import TaskDetailsModal from './TaskDetailsModal';
import ProjectDetailsModal from './ProjectDetailsModal';

// Local modal data shapes (narrow, matching modal props)
type TaskData = {
  _id?: string;
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  isEditing?: boolean;
};

type TaskDetailsData = {
  task: any;
  onEdit?: () => void;
};

type ProjectData = {
  _id?: string;
  name?: string;
  description?: string;
};

type ProjectDetailsData = {
  project: any;
  onEdit?: () => void;
};

type ConfirmData = {
  title?: string;
  message?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const ModalManager: React.FC = () => {
  const dispatch = useDispatch();
  const { modal } = useSelector((state: RootState) => state.ui);

  if (!modal.isOpen || !modal.type) return null;

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

const renderModal = () => {
    switch (modal.type) {
      case 'task':
        return <TaskModal data={modal.data ? (modal.data as unknown as TaskData) : undefined} onClose={handleClose} />;
      case 'taskDetails':
        const taskDetailsData = modal.data as unknown as TaskDetailsData;
        return (
          <TaskDetailsModal
            task={taskDetailsData?.task}
            onClose={handleClose}
            onEdit={taskDetailsData?.onEdit}
          />
        );
      case 'project':
        return <ProjectModal data={modal.data ? (modal.data as unknown as ProjectData) : undefined} onClose={handleClose} />;
      case 'projectDetails':
        const projectDetailsData = modal.data as unknown as ProjectDetailsData;
        return (
          <ProjectDetailsModal
            project={projectDetailsData?.project}
            onClose={handleClose}
            onEdit={projectDetailsData?.onEdit}
          />
        );
      case 'confirm':
        return <ConfirmModal data={modal.data ? (modal.data as unknown as ConfirmData) : undefined} onClose={handleClose} />;
      default:
        return null;
    }
  };

 return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden={!modal.isOpen}
    >
      {renderModal()}
    </div>
  );
};

export default ModalManager;