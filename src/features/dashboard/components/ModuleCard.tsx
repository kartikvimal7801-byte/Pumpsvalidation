import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'accent' | 'success' | 'info';
  stats: {
    active: number;
    completed: number;
    total: number;
  };
  onClick: () => void;
  isExternal?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  color,
  stats,
  onClick,
  isExternal = false,
}) => {
  const colorClasses = {
    primary: {
      border: 'border-l-primary-500 hover:border-l-primary-600',
      icon: 'text-primary-600 bg-primary-100',
      button: 'text-primary-600 hover:text-primary-700',
    },
    accent: {
      border: 'border-l-accent-500 hover:border-l-accent-600',
      icon: 'text-accent-600 bg-accent-100',
      button: 'text-accent-600 hover:text-accent-700',
    },
    success: {
      border: 'border-l-success-500 hover:border-l-success-600',
      icon: 'text-success-600 bg-success-100',
      button: 'text-success-600 hover:text-success-700',
    },
    info: {
      border: 'border-l-cyan-500 hover:border-l-cyan-600',
      icon: 'text-cyan-600 bg-cyan-100',
      button: 'text-cyan-600 hover:text-cyan-700',
    },
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <div
        className={`cursor-pointer border-l-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${colorClasses[color].border} hover:shadow-lg transition-all duration-300 h-full flex flex-col`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color].icon}`}>
            {icon}
          </div>
          <div className="flex items-center gap-1">
            {isExternal && (
              <ExternalLink className="h-4 w-4 text-gray-400" />
            )}
            <ArrowRight className={`h-5 w-5 ${colorClasses[color].button} transition-colors duration-200`} />
          </div>
        </div>
        
        <div className="mb-4 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm font-medium text-gray-600 mb-2">{subtitle}</p>
          <p className="text-sm text-gray-500 leading-relaxed min-h-[3rem]">{description}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 mt-auto">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};