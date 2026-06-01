import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card } from '@/components/common';
import { ProjectCard } from '@/components/project/ProjectCard';
import { ProjectForm } from '@/components/project/ProjectForm';
import { ProjectSearch } from '@/components/project/ProjectSearch';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { Project, ProjectStatus } from '@/types';
import { getPumpCategoryById } from '@/data/pumpCategories';

interface ProjectFormData {
  name: string;
  owner: string;
  startDate: string;
  description?: string;
}

export default function VAVESourceProjects() {
  const { categoryId, method, source } = useParams<{ categoryId: string; method: string; source: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const pumpCategory = getPumpCategoryById(categoryId as any);
  const decodedSource = source ? decodeURIComponent(source) : '';
  const vaveMethod = method?.toUpperCase() as 'VA' | 'VE';

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);

  useEffect(() => {
    loadProjects();
  }, [categoryId, source]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjectsByModule('vave');
      if (response.success && response.data) {
        // Filter by pump category and cost saving source
        setAllProjects(
          response.data.filter(
            (p) => p.pumpCategory === categoryId && p.costSavingSource === decodedSource
          )
        );
      } else {
        setError(response.error?.message || 'Failed to load projects');
      }
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: ProjectFormData) => {
    if (!user) return;
    try {
      setFormLoading(true);
      const response = await projectService.createProject(
        {
          name: data.name,
          owner: data.owner,
          startDate: data.startDate,
          description: data.description,
          moduleType: 'vave',
          pumpCategory: categoryId,
          vaveMethod: vaveMethod,
          costSavingSource: decodedSource,
        },
        user.id
      );
      if (response.success && response.data) {
        setAllProjects((prev) => [response.data!, ...prev]);
        setShowCreateForm(false);
        // Navigate to workspace
        navigate(`/workspace/vave/${response.data.id}`);
      } else {
        throw new Error(response.error?.message || 'Failed to create project');
      }
    } catch (err) {
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    try {
      setFormLoading(true);
      const response = await projectService.updateProject(editingProject.id, {
        name: data.name,
        owner: data.owner,
        startDate: data.startDate,
        description: data.description,
      });
      if (response.success && response.data) {
        setAllProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? response.data! : p))
        );
        setEditingProject(null);
      } else {
        throw new Error(response.error?.message || 'Failed to update project');
      }
    } catch (err) {
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        setAllProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        alert(response.error?.message || 'Failed to delete project');
      }
    } catch {
      alert('Failed to delete project');
    }
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/workspace/vave/${project.id}`);
  };

  const filteredProjects = allProjects.filter((project) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      project.name.toLowerCase().includes(q) ||
      project.id.toLowerCase().includes(q) ||
      project.owner.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(project.status);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/vave/method/${categoryId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Method Selection
              </Button>
              <span className="text-gray-300">|</span>
              <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${vaveMethod === 'VA' ? 'bg-blue-600' : 'bg-orange-600'}`}>
                {vaveMethod}
              </span>
              <h1 className="text-base font-bold text-gray-900 truncate">
                {decodedSource}
              </h1>
            </div>

            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Source info strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between gap-4 mb-6 p-4 rounded-xl border ${vaveMethod === 'VA' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${vaveMethod === 'VA' ? 'text-blue-900' : 'text-orange-900'}`}>
              {decodedSource}
            </h2>
            <p className={`text-sm ${vaveMethod === 'VA' ? 'text-blue-600' : 'text-orange-600'}`}>
              {pumpCategory?.name} • {vaveMethod === 'VA' ? 'Value Analysis' : 'Value Engineering'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${vaveMethod === 'VA' ? 'text-blue-900' : 'text-orange-900'}`}>
              {allProjects.length}
            </p>
            <p className={`text-xs ${vaveMethod === 'VA' ? 'text-blue-600' : 'text-orange-600'}`}>
              Total Projects
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <ProjectSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onClearFilters={() => {
              setSearchQuery('');
              setStatusFilter([]);
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <Card className="p-5 mb-6 border-red-200 bg-red-50">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Error loading projects
                </p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProjects}
                className="ml-4"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded mb-4 w-1/3" />
                <div className="h-5 bg-gray-200 rounded mb-4 w-1/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Project grid */}
        {!loading && !error && (
          <>
            {filteredProjects.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {filteredProjects.length} project
                  {filteredProjects.length !== 1 ? 's' : ''}
                  {searchQuery || statusFilter.length > 0 ? ' found' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={setEditingProject}
                      onDelete={handleDeleteProject}
                      onOpen={handleOpenProject}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {allProjects.length === 0
                      ? 'No projects yet'
                      : 'No projects match your filters'}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {allProjects.length === 0
                      ? `Create the first project for ${decodedSource}.`
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                  {allProjects.length === 0 && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Create project modal */}
      <ProjectForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateProject}
        moduleType="vave"
        isLoading={formLoading}
        pumpCategory={pumpCategory || undefined}
      />

      {/* Edit project modal */}
      <ProjectForm
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleEditProject}
        project={editingProject}
        moduleType="vave"
        isLoading={formLoading}
      />
    </div>
  );
}
