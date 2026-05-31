// Mock project data for development
// In production, this would be replaced with actual database calls

import { Project, ModuleType, ProjectStatus } from '@/types';

export const mockProjects: Project[] = [
  // NPD Projects
  {
    id: 'npd-001',
    name: 'Self Priming Pump Development',
    owner: 'Kartik Vimal',
    startDate: '2024-01-15',
    description: 'Development of a new self-priming pump for industrial applications.',
    moduleType: 'npd',
    status: 'active',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'npd-002',
    name: 'High Efficiency Centrifugal Pump',
    owner: 'Kartik Vimal',
    startDate: '2024-01-10',
    description: 'Next-generation centrifugal pump with improved hydraulic efficiency.',
    moduleType: 'npd',
    status: 'active',
    createdBy: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'npd-003',
    name: 'Smart IoT Enabled Pump System',
    owner: 'Rahul Sharma',
    startDate: '2023-12-05',
    description: 'IoT-enabled pump system with remote monitoring and control capabilities.',
    moduleType: 'npd',
    status: 'completed',
    createdBy: '2',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2024-01-05'),
  },

  // VA/VE Projects
  {
    id: 'vave-001',
    name: 'Pump Motor Efficiency Optimization',
    owner: 'Kartik Vimal',
    startDate: '2024-01-12',
    moduleType: 'vave',
    status: 'active',
    createdBy: '1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: 'vave-002',
    name: 'Material Cost Reduction Analysis',
    owner: 'Rahul Sharma',
    startDate: '2024-01-08',
    moduleType: 'vave',
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'vave-003',
    name: 'Manufacturing Process Improvement',
    owner: 'Kartik Vimal',
    startDate: '2023-12-20',
    moduleType: 'vave',
    status: 'on-hold',
    createdBy: '1',
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-02'),
  },

  // Standardization Projects
  {
    id: 'std-001',
    name: 'Quality Control Standards Update',
    owner: 'Rahul Sharma',
    startDate: '2024-01-14',
    moduleType: 'standardization',
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 'std-002',
    name: 'Testing Protocol Standardization',
    owner: 'Kartik Vimal',
    startDate: '2023-11-30',
    moduleType: 'standardization',
    status: 'completed',
    createdBy: '1',
    createdAt: new Date('2023-11-30'),
    updatedAt: new Date('2023-12-28'),
  },
  {
    id: 'std-003',
    name: 'Documentation Standards Review',
    owner: 'Rahul Sharma',
    startDate: '2024-01-06',
    moduleType: 'standardization',
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-13'),
  },
];

// Helper functions for project management
export const getProjectsByModule = (moduleType: ModuleType): Project[] => {
  return mockProjects.filter(project => project.moduleType === moduleType);
};

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getProjectsByUser = (userId: string): Project[] => {
  return mockProjects.filter(project => project.createdBy === userId);
};

export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return mockProjects.filter(project => project.status === status);
};

// Generate a unique project ID using a timestamp suffix to avoid collisions across users
export const generateProjectId = (moduleType: ModuleType): string => {
  const prefix =
    moduleType === 'npd' ? 'npd' : moduleType === 'vave' ? 'vave' : 'std';
  const suffix = Date.now().toString(36).toUpperCase(); // e.g. "LX7K2A"
  return `${prefix}-${suffix}`;
};