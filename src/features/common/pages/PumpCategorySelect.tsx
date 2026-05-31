import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ModuleType } from '@/types';
import { PumpCategoryId, getPumpCategoriesForModule } from '@/data/pumpCategories';

interface PumpCategorySelectProps {
  moduleType: ModuleType;
  onSelect: (categoryId: PumpCategoryId) => void;
  onBack: () => void;
}

const MODULE_LABELS: Record<ModuleType, { title: string; subtitle: string; color: string }> = {
  npd:             { title: 'NPD',             subtitle: 'New Product Development',            color: 'bg-blue-600' },
  vave:            { title: 'VA/VE',           subtitle: 'Value Analysis / Value Engineering', color: 'bg-amber-600' },
  standardization: { title: 'Standardization', subtitle: 'Process Standardization',            color: 'bg-green-600' },
};

export default function PumpCategorySelect({ moduleType, onSelect, onBack }: PumpCategorySelectProps) {
  const categories = getPumpCategoriesForModule(moduleType);
  const mod = MODULE_LABELS[moduleType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {mod.title} Projects
            </button>
            <span className="text-gray-300">|</span>
            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${mod.color}`}>
              {mod.title}
            </span>
            <span className="text-sm text-gray-500">{mod.subtitle}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Select Pump Type</h1>
          <p className="text-gray-500 text-sm">
            Click a pump category to start creating your {mod.title} project
          </p>
        </div>

        {/* Grid — single click opens the create form immediately */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.035 }}
              onClick={() => onSelect(category.id)}
              className="relative bg-white rounded-xl border-2 border-gray-200 cursor-pointer
                         hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]
                         active:scale-[0.98] transition-all duration-150 overflow-hidden group"
            >
              {/* Image */}
              <div className="h-36 bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/pumpimages/pump-image-1.png';
                  }}
                />
              </div>

              {/* Label */}
              <div className="px-3 py-2.5 border-t border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/40 transition-colors">
                <p className="text-xs font-semibold text-center text-gray-800 leading-tight group-hover:text-blue-800">
                  {category.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
