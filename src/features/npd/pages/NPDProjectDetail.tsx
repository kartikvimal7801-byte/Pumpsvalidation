import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Clock, AlertCircle } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';
import { formatDate, getStatusColor } from '@/utils';
import NPDWorkflow from '../components/NPDWorkflow';

export default function NPDProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjectById(projectId);
        if (res.success && res.data) setProject(res.data);
        else setError(res.error?.message ?? 'Project not found');
      } catch { setError('Failed to load project'); }
      finally { setLoading(false); }
    })();
  }, [projectId]);

  const statusLabel = project
    ? project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')
    : '';

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center h-14 gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/npd')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to NPD
          </Button>
          {project && (
            <>
              <span className="text-gray-300">|</span>
              <h1 className="text-base font-bold text-gray-900 truncate">{project.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(project.status)}`}>
                {statusLabel}
              </span>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 lg:px-8 py-3 gap-3">
        {loading && (
          <div className="animate-pulse grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <Card key={i} className="p-3"><div className="h-8 bg-gray-200 rounded" /></Card>)}
          </div>
        )}

        {!loading && error && (
          <Card className="p-8 text-center max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/npd')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
          </Card>
        )}

        {!loading && !error && project && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }} className="flex flex-col gap-3 flex-1 min-h-0">

            {/* Info strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              {[
                { icon: <User className="h-4 w-4 text-blue-600" />, bg: 'bg-blue-50', label: 'Owner', value: project.owner },
                { icon: <Calendar className="h-4 w-4 text-green-600" />, bg: 'bg-green-50', label: 'Start Date', value: project.startDate ? formatDate(project.startDate) : '—' },
                { icon: <Clock className="h-4 w-4 text-purple-600" />, bg: 'bg-purple-50', label: 'Created', value: formatDate(project.createdAt) },
                { icon: <Tag className="h-4 w-4 text-orange-600" />, bg: 'bg-orange-50', label: 'Module', value: project.moduleType.toUpperCase() },
              ].map(({ icon, bg, label, value }) => (
                <Card key={label} className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 ${bg} rounded-lg flex-shrink-0`}>{icon}</div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {project.description && (
              <Card className="p-3 flex-shrink-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
              </Card>
            )}

            {/* Flowchart — fills remaining height */}
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <NPDWorkflow projectId={project.id} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
