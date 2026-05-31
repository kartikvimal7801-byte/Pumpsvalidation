import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { ProjectCard } from '@/components/project/ProjectCard';
import { ProjectForm } from '@/components/project/ProjectForm';
import { ProjectSearch } from '@/components/project/ProjectSearch';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { projectService } from '@/services/projectService';
import { Project, ProjectStatus } from '@/types';
import PumpCategorySelect from '@/features/common/pages/PumpCategorySelect';
import { PumpCategoryId, PumpCategory, getPumpCategoryById } from '@/data/pumpCategories';

interface ProjectFormData {
  name: string;
  owner: string;
  startDate: string;
  description?: string;
}

export default function VAVEProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PumpCategoryId | null>(null);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState<PumpCategory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjectsByModule('vave');
      if (response.success && response.data) setProjects(response.data);
      else setError(response.error?.message || 'Failed to load projects');
    } catch { setError('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleCategorySelected = (categoryId: PumpCategoryId) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryObj(getPumpCategoryById(categoryId) ?? null);
    setShowCategorySelect(false);
    setShowCreateForm(true);
  };

  const handleCreateProject = async (data: ProjectFormData) => {
    if (!user) return;
    try {
      setFormLoading(true);
      const response = await projectService.createProject(
        { name: data.name, owner: data.owner, startDate: data.startDate, description: data.description, moduleType: 'vave', pumpCategory: selectedCategory ?? undefined },
        user.id
      );
      if (response.success && response.data) {
        setProjects(prev => [...prev, response.data!]);
        setShowCreateForm(false);
        setSelectedCategory(null);
      } else throw new Error(response.error?.message || 'Failed to create project');
    } catch (err) { throw err; }
    finally { setFormLoading(false); }
  };

  const handleEditProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    try {
      setFormLoading(true);
      const response = await projectService.updateProject(editingProject.id, { name: data.name, owner: data.owner, startDate: data.startDate, description: data.description });
      if (response.success && response.data) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? response.data! : p));
        setEditingProject(null);
      } else throw new Error(response.error?.message || 'Failed to update project');
    } catch (err) { throw err; }
    finally { setFormLoading(false); }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) setProjects(prev => prev.filter(p => p.id !== projectId));
      else alert(response.error?.message || 'Failed to delete project');
    } catch { alert('Failed to delete project'); }
  };

  const handleOpenProject = (project: Project) => navigate(`/workspace/vave/${project.id}`);
  const handleClearFilters = () => { setSearchQuery(''); setStatusFilter([]); };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);
    return matchesSearch && matchesStatus;
  });

  if (showCategorySelect) {
    return (
      <PumpCategorySelect
        moduleType="vave"
        onSelect={handleCategorySelected}
        onBack={() => setShowCategorySelect(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">VA/VE Projects</h1>
            </div>
            <Button className="flex items-center" onClick={() => setShowCategorySelect(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Value Analysis / Value Engineering Projects</h2>
          <p className="text-gray-600">Optimize product value through systematic analysis and engineering improvements.</p>
        </div>

        <div className="mb-6">
          <ProjectSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onClearFilters={handleClearFilters} />
        </div>

        {error && (
          <Card className="p-6 mb-6 border-danger-200 bg-danger-50">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-danger-600 mr-3" />
              <div><h3 className="text-sm font-medium text-danger-800">Error Loading Projects</h3><p className="text-sm text-danger-600 mt-1">{error}</p></div>
              <Button variant="outline" size="sm" onClick={loadProjects} className="ml-auto">Retry</Button>
            </div>
          </Card>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" /><div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
                <div className="h-6 bg-gray-200 rounded mb-4 w-1/3" /><div className="space-y-2"><div className="h-3 bg-gray-200 rounded" /><div className="h-3 bg-gray-200 rounded" /></div>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} onEdit={setEditingProject} onDelete={handleDeleteProject} onOpen={handleOpenProject} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Plus className="h-8 w-8 text-gray-400" /></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}</h3>
                  <p className="text-gray-500 mb-6">{projects.length === 0 ? 'Get started by creating your first VA/VE project.' : 'Try adjusting your search or filter criteria.'}</p>
                  {projects.length === 0 && <Button onClick={() => setShowCategorySelect(true)}><Plus className="h-4 w-4 mr-2" />Create First Project</Button>}
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      <ProjectForm isOpen={showCreateForm} onClose={() => { setShowCreateForm(false); setSelectedCategory(null); setSelectedCategoryObj(null); }} onSubmit={handleCreateProject} moduleType="vave" isLoading={formLoading} pumpCategory={selectedCategoryObj} />
      <ProjectForm isOpen={!!editingProject} onClose={() => setEditingProject(null)} onSubmit={handleEditProject} project={editingProject} moduleType="vave" isLoading={formLoading} />
    </div>
  );
}
