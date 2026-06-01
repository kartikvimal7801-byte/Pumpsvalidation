import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, MoreVertical, Edit, Trash2, MousePointerClick } from 'lucide-react';
import { Project } from '@/types';
import { formatDate, getStatusColor } from '@/utils';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onOpen?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onOpen,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleDoubleClick = () => {
    if (onOpen) onOpen(project);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) onEdit(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(project.id);
  };

  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="cursor-pointer hover:shadow-lg transition-all duration-200 relative bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        onDoubleClick={handleDoubleClick}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
              {project.name}
            </h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-mono">
              {project.id}
            </p>
          </div>

          {/* Context menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Project options"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[130px]"
              >
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {statusLabel}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">{project.owner}</span>
          </div>

          {project.status === 'completed' && project.completedAt ? (
            <div className="flex items-center text-xs text-green-600 font-medium">
              <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
              Completed: {formatDate(project.completedAt)}
            </div>
          ) : (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
              Created: {formatDate(project.createdAt)}
            </div>
          )}
        </div>

        {/* Double-click hint */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1">
          <MousePointerClick className="h-3 w-3 text-gray-300" />
          <p className="text-xs text-gray-300">Double-click to open</p>
        </div>
      </div>

      {/* Backdrop to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </motion.div>
  );
};
