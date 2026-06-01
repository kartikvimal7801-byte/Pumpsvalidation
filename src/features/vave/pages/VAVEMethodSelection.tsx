import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common';
import { projectService } from '@/services/projectService';

type VAVEMethod = 'VA' | 'VE' | null;
type CostSavingSource = string | null;

const VA_SOURCES = [
  'Supplier Negotiation',
  'Component Standardization',
  'Process Optimization',
  'Inventory Reduction',
  'Quality Improvement',
  'Waste Reduction',
];

const VE_SOURCES = [
  'Design Modification',
  'Material Substitution',
  'Process Redesign',
  'Product Specification Optimization',
  'Functionality Improvement',
  'New Technology Solutions',
];

export default function VAVEMethodSelection() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [selectedMethod, setSelectedMethod] = useState<VAVEMethod>(null);
  const [selectedSource, setSelectedSource] = useState<CostSavingSource>(null);
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({});

  // Load project counts
  useEffect(() => {
    loadProjectCounts();
  }, [categoryId]);

  const loadProjectCounts = async () => {
    try {
      const response = await projectService.getProjectsByModule('vave');
      if (response.success && response.data) {
        const counts: Record<string, number> = {};
        response.data.forEach((project) => {
          // Only count projects for the current pump category
          if (project.costSavingSource && project.pumpCategory === categoryId) {
            counts[project.costSavingSource] = (counts[project.costSavingSource] || 0) + 1;
          }
        });
        setProjectCounts(counts);
      }
    } catch (error) {
      console.error('Failed to load project counts:', error);
    }
  };

  const handleMethodSelect = (method: 'VA' | 'VE') => {
    setSelectedMethod(method);
    setSelectedSource(null); // Reset source when method changes
  };

  const handleSourceSelect = (source: string) => {
    setSelectedSource(source);
    // Navigate to source workspace instead of opening form
    navigate(`/vave/source/${categoryId}/${selectedMethod}/${encodeURIComponent(source)}`);
  };

  const sources = selectedMethod === 'VA' ? VA_SOURCES : selectedMethod === 'VE' ? VE_SOURCES : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/vave')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Pump Selection
            </Button>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-amber-600">
              VA/VE
            </span>
            <span className="text-sm text-gray-500">Value Analysis / Value Engineering</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VA/VE</h1>
          <p className="text-gray-600">Select your approach for cost optimization</p>
        </div>

        {/* Method Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          {/* Value Analysis Card */}
          <motion.div
            animate={{
              scale: selectedMethod === 'VA' ? 1.05 : selectedMethod === 'VE' ? 0.95 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={() => handleMethodSelect('VA')}
            className={`relative bg-white rounded-2xl p-8 cursor-pointer transition-all duration-300
              ${selectedMethod === 'VA'
                ? 'border-4 border-blue-500 shadow-2xl shadow-blue-200'
                : 'border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg'
              }`}
          >
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-colors
                ${selectedMethod === 'VA' ? 'bg-blue-600' : 'bg-blue-100'}`}>
                <svg className={`w-10 h-10 ${selectedMethod === 'VA' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Value Analysis (VA)</h2>
              <p className="text-gray-600 text-sm">For existing product cost optimization</p>
            </div>
            {selectedMethod === 'VA' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Value Engineering Card */}
          <motion.div
            animate={{
              scale: selectedMethod === 'VE' ? 1.05 : selectedMethod === 'VA' ? 0.95 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={() => handleMethodSelect('VE')}
            className={`relative bg-white rounded-2xl p-8 cursor-pointer transition-all duration-300
              ${selectedMethod === 'VE'
                ? 'border-4 border-orange-500 shadow-2xl shadow-orange-200'
                : 'border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg'
              }`}
          >
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-colors
                ${selectedMethod === 'VE' ? 'bg-orange-600' : 'bg-orange-100'}`}>
                <svg className={`w-10 h-10 ${selectedMethod === 'VE' ? 'text-white' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-orange-900 mb-2">Value Engineering (VE)</h2>
              <p className="text-gray-600 text-sm">For new product development and cost reduction</p>
            </div>
            {selectedMethod === 'VE' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4"
              >
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Cost Saving Sources Section */}
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className={`bg-white rounded-2xl p-8 border-2 ${selectedMethod === 'VA' ? 'border-blue-200' : 'border-orange-200'}`}>
              <h3 className={`text-2xl font-bold mb-6 text-center ${selectedMethod === 'VA' ? 'text-blue-900' : 'text-orange-900'}`}>
                Cost Saving Sources
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map((source, index) => {
                  const count = projectCounts[source] || 0;
                  return (
                    <motion.button
                      key={source}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleSourceSelect(source)}
                      className={`p-6 rounded-xl text-left transition-all duration-200 transform hover:scale-105 relative
                        ${selectedSource === source
                          ? selectedMethod === 'VA'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                          : selectedMethod === 'VA'
                            ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 border-2 border-blue-200'
                            : 'bg-orange-50 text-orange-900 hover:bg-orange-100 border-2 border-orange-200'
                        }`}
                    >
                      {/* Project Count Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold
                          ${selectedSource === source
                            ? 'bg-white bg-opacity-30 text-white'
                            : selectedMethod === 'VA'
                              ? 'bg-blue-600 text-white'
                              : 'bg-orange-600 text-white'
                          }`}>
                          {count}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                          ${selectedSource === source
                            ? 'bg-white bg-opacity-20'
                            : selectedMethod === 'VA'
                              ? 'bg-blue-100'
                              : 'bg-orange-100'
                          }`}>
                          <svg className={`w-5 h-5 ${selectedSource === source ? 'text-white' : selectedMethod === 'VA' ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 pr-8">
                          <p className="font-semibold text-sm leading-tight mb-1">{source}</p>
                          <p className={`text-xs ${selectedSource === source ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                            {count} {count === 1 ? 'Project' : 'Projects'}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
