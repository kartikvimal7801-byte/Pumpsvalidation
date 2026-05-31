import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ModuleType,
  ApiResponse,
  SearchParams,
} from '@/types';
import { generateProjectId } from '@/data/mockProjects';
import { storage } from '@/utils';
import { authService } from '@/services/authService';

// Project service class for managing project operations.
// All data is scoped per user — each user has their own isolated localStorage key.
class ProjectService {
  private readonly KEY_PREFIX = 'npd_projects_v3';

  // Build a user-scoped storage key. Falls back to 'guest' if no user is logged in.
  private storageKey(): string {
    const user = authService.getCurrentUser();
    const userId = user?.id ?? 'guest';
    return `${this.KEY_PREFIX}_${userId}`;
  }

  // Get all projects for the current user
  private getStoredProjects(): Project[] {
    const stored = storage.get<Project[]>(this.storageKey());
    if (!stored || stored.length === 0) return [];

    // Ensure Date objects are properly hydrated from JSON
    return stored.map((project) => ({
      ...project,
      owner: project.owner ?? 'Unknown',
      startDate: project.startDate ?? '',
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
  }

  // Save projects for the current user
  private saveProjects(projects: Project[]): void {
    storage.set(this.storageKey(), projects);
  }

  // Get projects by module type (current user only)
  async getProjectsByModule(moduleType: ModuleType): Promise<ApiResponse<Project[]>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const allProjects = this.getStoredProjects();
      const moduleProjects = allProjects.filter((p) => p.moduleType === moduleType);

      return {
        success: true,
        data: moduleProjects,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch projects' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get project by ID (current user only)
  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const project = this.getStoredProjects().find((p) => p.id === id);

      if (!project) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: project,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Failed to fetch project' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Create new project (stored under current user)
  async createProject(
    projectData: CreateProjectRequest,
    userId: string
  ): Promise<ApiResponse<Project>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const allProjects = this.getStoredProjects();
      const newProject: Project = {
        id: generateProjectId(projectData.moduleType),
        name: projectData.name,
        owner: projectData.owner,
        startDate: projectData.startDate,
        description: projectData.description,
        moduleType: projectData.moduleType,
        pumpCategory: projectData.pumpCategory,
        status: 'active',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.saveProjects([...allProjects, newProject]);

      return {
        success: true,
        data: newProject,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'CREATE_ERROR', message: 'Failed to create project' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Update project
  async updateProject(
    id: string,
    updates: UpdateProjectRequest
  ): Promise<ApiResponse<Project>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const allProjects = this.getStoredProjects();
      const idx = allProjects.findIndex((p) => p.id === id);

      if (idx === -1) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
          timestamp: new Date().toISOString(),
        };
      }

      const updatedProject: Project = {
        ...allProjects[idx],
        ...updates,
        updatedAt: new Date(),
      };

      allProjects[idx] = updatedProject;
      this.saveProjects(allProjects);

      return {
        success: true,
        data: updatedProject,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'UPDATE_ERROR', message: 'Failed to update project' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Delete project
  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const allProjects = this.getStoredProjects();
      const idx = allProjects.findIndex((p) => p.id === id);

      if (idx === -1) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
          timestamp: new Date().toISOString(),
        };
      }

      allProjects.splice(idx, 1);
      this.saveProjects(allProjects);

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'DELETE_ERROR', message: 'Failed to delete project' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Search projects (current user only)
  async searchProjects(params: SearchParams): Promise<ApiResponse<Project[]>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      let projects = this.getStoredProjects();

      if (params.filters?.moduleType?.length) {
        projects = projects.filter((p) =>
          params.filters!.moduleType!.includes(p.moduleType)
        );
      }
      if (params.filters?.status?.length) {
        projects = projects.filter((p) =>
          params.filters!.status!.includes(p.status)
        );
      }
      if (params.filters?.createdBy?.length) {
        projects = projects.filter((p) =>
          params.filters!.createdBy!.includes(p.createdBy)
        );
      }
      if (params.query) {
        const q = params.query.toLowerCase();
        projects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q)
        );
      }
      if (params.sortBy) {
        projects.sort((a, b) => {
          const aVal = a[params.sortBy!];
          const bVal = b[params.sortBy!];
          if (aVal < bVal) return params.sortOrder === 'desc' ? 1 : -1;
          if (aVal > bVal) return params.sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit;
        projects = projects.slice(start, start + params.limit);
      }

      return {
        success: true,
        data: projects,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'SEARCH_ERROR', message: 'Failed to search projects' },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get project statistics (current user only)
  async getProjectStats(): Promise<ApiResponse<any>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const projects = this.getStoredProjects();

      return {
        success: true,
        data: {
          total: projects.length,
          active: projects.filter((p) => p.status === 'active').length,
          completed: projects.filter((p) => p.status === 'completed').length,
          onHold: projects.filter((p) => p.status === 'on-hold').length,
          byModule: {
            npd: projects.filter((p) => p.moduleType === 'npd').length,
            vave: projects.filter((p) => p.moduleType === 'vave').length,
            standardization: projects.filter((p) => p.moduleType === 'standardization').length,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        success: false,
        error: { code: 'STATS_ERROR', message: 'Failed to get project statistics' },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const projectService = new ProjectService();
