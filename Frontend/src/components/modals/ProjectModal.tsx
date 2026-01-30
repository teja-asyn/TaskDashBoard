import React from 'react';
import { useForm, Controller, type ControllerRenderProps } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiX, FiFolder, FiAlignLeft } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { closeModal } from '../../store/slices/uiSlice';
import { useCreateProjectMutation, useUpdateProjectMutation } from '../../store/api/projectApi';
import { toast } from 'react-hot-toast';
import Tooltip from '../common/Tooltip';

interface ProjectModalProps {
  data?: {
    _id?: string;
    name?: string;
    description?: string;
  };
  onClose?: () => void;
}

const projectSchema = yup.object({
  name: yup.string().required('Project name is required').max(100, 'Name must be less than 100 characters'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
});

type ProjectFormData = yup.InferType<typeof projectSchema>;

const ProjectModal: React.FC<ProjectModalProps> = ({ data, onClose }) => {
  const dispatch = useDispatch();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  
  const isEditMode = !!data?._id;
  const isLoading = isCreating || isUpdating;

  const { control, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      name: data?.name || '',
      description: data?.description || '',
    },
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch(closeModal());
    }
  };

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      if (isEditMode && data?._id) {
        await updateProject({ id: data._id, updates: formData }).unwrap();
        toast.success('Project updated successfully!');
      } else {
        await createProject(formData).unwrap();
        toast.success('Project created successfully!');
      }
      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else if (typeof err === 'object' && err && 'data' in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        toast.error(e?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} project`);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} project`);
      }
    }
  };

  return (
    <div 
      className="modal-overlay animate-fade-in" 
      onClick={(e) => e.target === e.currentTarget && !isLoading && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-modal w-full max-w-lg animate-slide-up"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !isLoading) {
            handleClose();
          }
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 id="project-modal-title" className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update project details' : 'Organize your tasks in a new project'}
            </p>
          </div>
          <Tooltip content="Close">
            <button
              onClick={handleClose}
              disabled={isLoading}
              aria-label="Close modal"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <FiX className="w-5 h-5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                <FiFolder className="inline mr-2 w-4 h-4" aria-hidden="true" />
                Project Name *
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id="project-name"
                    type="text"
                    placeholder="Enter project name"
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "project-name-error" : undefined}
                    className={`input-field ${errors.name ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.name && (
                <p id="project-name-error" className="mt-1 text-sm text-danger-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
                <FiAlignLeft className="inline mr-2 w-4 h-4" aria-hidden="true" />
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }: { field: ControllerRenderProps<ProjectFormData, 'description'> }) => (
                  <textarea
                    {...field}
                    id="project-description"
                    rows={3}
                    placeholder="Describe the project..."
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? "project-description-error" : "project-description-hint"}
                    className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                )}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p id="project-description-error" className="text-sm text-danger-600" role="alert">
                    {errors.description.message}
                  </p>
                )}
                <span id="project-description-hint" className="text-xs text-gray-500">
                  {control._formValues.description?.length || 0}/500
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Cancel and close modal"
                className="btn btn-outline px-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                aria-label={isEditMode ? "Update project" : "Create project"}
                className="btn btn-primary px-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-4 h-4 border-2 mr-2 inline-block"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update Project' : 'Create Project'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;