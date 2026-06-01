import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';
import { getPumpCategoriesForModule } from '@/data/pumpCategories';
import { projectService } from '@/services/projectService';
import { ModuleType } from '@/types';

interface PumpSelectionProps {
  moduleType: ModuleType;
  moduleLabel: string;
  moduleDescription: string;
  badgeColor: string;
  onCategorySelect: (categoryId: string) => void;
  showIdeaBank?: boolean;
  onIdeaBankClick?: () => void;
}

export default function PumpSelection({
  moduleType,
  moduleLabel,
  moduleDescription,
  badgeColor,
  onCategorySelect,
  showIdeaBank = false,
  onIdeaBankClick,
}: PumpSelectionProps) {
  const navigate = useNavigate();
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});
  const categories = getPumpCategoriesForModule(moduleType);

  useEffect(() => {
    projectService.getProjectsByModule(moduleType).then((res) => {
      if (res.success && res.data) {
        const counts: Record<string, number> = {};
        res.data.forEach((p) => {
          if (p.pumpCategory) {
            counts[p.pumpCategory] = (counts[p.pumpCategory] ?? 0) + 1;
          }
        });
        setProjectCounts(counts);
      }
    });
  }, [moduleType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Dashboard
              </Button>
              <span className="text-gray-300">|</span>
              <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${badgeColor}`}>
                {moduleLabel}
              </span>
              <span className="text-sm text-gray-500">{moduleDescription}</span>
            </div>
            
            {/* Idea Bank Button */}
            {showIdeaBank && onIdeaBankClick && (
              <Button
                onClick={onIdeaBankClick}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <span className="text-lg">💡</span>
                <span className="font-semibold">Idea Bank</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Select Pump Type</h1>
          <p className="text-gray-500 text-sm">
            Click a pump category to view and manage its {moduleLabel} projects
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const count = projectCounts[category.id] ?? 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                onClick={() => onCategorySelect(category.id)}
                className="relative bg-white rounded-xl border-2 border-gray-200 cursor-pointer
                           hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]
                           active:scale-[0.98] transition-all duration-150 overflow-hidden group"
              >
                {/* Project count badge — top-right corner */}
                <div className="absolute top-2 right-2 z-10">
                  <span
                    className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5
                      rounded-full text-[11px] font-bold shadow-sm
                      ${count > 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {count}
                  </span>
                </div>

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
            );
          })}
        </div>
      </main>
    </div>
  );
}
