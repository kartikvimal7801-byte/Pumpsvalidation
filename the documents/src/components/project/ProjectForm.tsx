import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '@/components/common';
import { Project, ModuleType } from '@/types';
import { PumpCategory } from '@/data/pumpCategories';

interface ProjectFormData {
  name: string;
  owner: string;
  startDate: string;
  description?: string;
}

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  project?: Project | null;
  moduleType: ModuleType;
  isLoading?: boolean;
  /** When creating a new project, the pump category selected on the previous screen */
  pumpCategory?: PumpCategory | null;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  moduleType,
  isLoading = false,
  pumpCategory,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      owner: project?.owner || '',
      startDate: project?.startDate || '',
      description: project?.description || '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: project?.name || '',
        owner: project?.owner || '',
        startDate: project?.startDate || '',
        description: project?.description || '',
      });
    }
  }, [isOpen, project, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to save project',
      });
    }
  };

  const getModuleDisplayName = (type: ModuleType): string => {
    switch (type) {
      case 'npd':
        return 'NPD — New Product Development';
      case 'vave':
        return 'VA/VE — Value Analysis / Value Engineering';
      case 'standardization':
        return 'Standardization';
      default:
        return (type as string).toUpperCase();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Module Type (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Type
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
            {getModuleDisplayName(moduleType)}
          </div>
        </div>

        {/* Pump Category — shown only when creating a new project with a selected category */}
        {pumpCategory && !project && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pump Category
            </label>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-10 h-10 flex-shrink-0 bg-white rounded-lg border border-blue-100 flex items-center justify-center overflow-hidden">
                <img
                  src={pumpCategory.image}
                  alt={pumpCategory.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/pumpimages/pump-image-1.png';
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-900 leading-tight">
                  {pumpCategory.name}
                </p>
                <p className="text-xs text-blue-600 mt-0.5 line-clamp-1">
                  {pumpCategory.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Project Name */}
        <Input
          label="Project Name *"
          placeholder="e.g. Self Priming Pump Development"
          error={errors.name?.message}
          {...register('name', {
            required: 'Project name is required',
            minLength: { value: 3, message: 'Must be at least 3 characters' },
            maxLength: { value: 100, message: 'Must be less than 100 characters' },
          })}
        />

        {/* Project Owner */}
        <Input
          label="Project Owner *"
          placeholder="e.g. Kartik Vimal"
          error={errors.owner?.message}
          {...register('owner', {
            required: 'Project owner is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' },
          })}
        />

        {/* Start Date */}
        <Input
          label="Start Date *"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate', {
            required: 'Start date is required',
          })}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            {...register('description')}
            placeholder="Brief description of the project..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 resize-none text-sm"
          />
        </div>

        {/* Root error */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
