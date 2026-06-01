// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Project Types
export type ModuleType = 'npd' | 'vave' | 'standardization';
export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  owner: string;
  startDate: string;
  description?: string;
  moduleType: ModuleType;
  pumpCategory?: string; // PumpCategoryId
  vaveMethod?: 'VA' | 'VE'; // VA or VE selection
  costSavingSource?: string; // Selected cost saving source
  status: ProjectStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date; // Completion date when all stages reach 100%
  flowchartData?: FlowchartData;
  stageProgress?: StageProgress; // L1-L5 progress tracking
}

// Stage Progress for VA/VE Projects
export interface StageProgress {
  L1: StageData;
  L2: StageData;
  L3: StageData;
  L4: StageData;
  L5: StageData;
}

export interface StageData {
  status: 'locked' | 'in-progress' | 'completed';
  completionPercentage: number;
  uploadedFiles: UploadedFile[];
  lastUpdated?: Date;
  completedAt?: Date; // Date when stage reached 100%
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  url?: string;
  data?: string; // Base64 encoded file data for client-side storage
}

export interface CreateProjectRequest {
  name: string;
  owner: string;
  startDate: string;
  description?: string;
  moduleType: ModuleType;
  pumpCategory?: string; // PumpCategoryId
  vaveMethod?: 'VA' | 'VE';
  costSavingSource?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  owner?: string;
  startDate?: string;
  description?: string;
  status?: ProjectStatus;
  stageProgress?: StageProgress;
  completedAt?: Date;
}

// Flowchart Types
export interface FlowchartData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
}

export interface FlowNode {
  id: string;
  type: 'process' | 'decision' | 'milestone' | 'start' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    status?: 'pending' | 'approved' | 'rejected';
    comments?: string;
    color?: string;
    description?: string;
  };
  style?: React.CSSProperties;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Workflow Validation Types
export interface WorkflowValidation {
  id: string;
  projectId: string;
  nodeId: string;
  validationCriteria: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Search and Filter Types
export interface ProjectFilters {
  status?: ProjectStatus[];
  moduleType?: ModuleType[];
  createdBy?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchParams {
  query?: string;
  filters?: ProjectFilters;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Component Props Types
export interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

export interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onOpen?: (project: Project) => void;
}

export interface FlowchartWorkspaceProps {
  projectId: string;
  initialData?: FlowchartData;
  onSave?: (data: FlowchartData) => void;
  readOnly?: boolean;
}

// Form Types
export interface ProjectFormData {
  name: string;
  owner: string;
  startDate: string;
  description?: string;
}

export interface NodeEditFormData {
  label: string;
  description?: string;
  comments?: string;
  color?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Navigation Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  projectsByModule: Record<ModuleType, number>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}