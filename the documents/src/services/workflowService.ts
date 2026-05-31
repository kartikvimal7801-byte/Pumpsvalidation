import { storage } from '@/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  dataUrl: string; // base64 stored in localStorage
}

export interface ValidationCriterion {
  id: string;
  label: string;
  required: boolean;
  status: 'pending' | 'pass' | 'fail';
  comment?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

export type NodeStatus = 'idle' | 'uploaded' | 'approved' | 'partial' | 'rejected';

export interface StageData {
  nodeId: string;
  status: NodeStatus;
  files: UploadedFile[];
  validationCriteria: ValidationCriterion[];
  reviewComment: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  auditTrail: AuditEntry[];
  inheritedData?: Record<string, string>;
}

export interface WorkflowState {
  projectId: string;
  stages: Record<string, StageData>;
  lastSaved: string;
}

export interface WorkflowMetrics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  compliancePercent: number;
  progressPercent: number;
}

// ─── Default validation criteria per node ────────────────────────────────────

const DEFAULT_CRITERIA: Record<string, string[]> = {
  'marketing-input': [
    'RFQ document received',
    'Customer requirements documented',
    'Market analysis complete',
  ],
  acceptance: [
    'Technical feasibility confirmed',
    'Cost estimate approved',
    'Management sign-off obtained',
  ],
  'proto-reports': [
    'Prototype test report uploaded',
    'Performance metrics documented',
    'Defects logged',
  ],
  'proto-retest': [
    'Prototype test report uploaded',
    'Performance metrics documented',
    'Defects logged',
  ],
  'n10-reports': [
    'N10 test completed',
    'Results within tolerance',
    'Sign-off obtained',
  ],
  'n10-retest': [
    'N10 test completed',
    'Results within tolerance',
    'Sign-off obtained',
  ],
  reliability: [
    'Reliability test plan approved',
    'MTBF targets defined',
  ],
  qra: [
    'QRA document uploaded',
    'Risk assessment complete',
  ],
  're-reliability': [
    'Reliability test plan approved',
    'MTBF targets defined',
  ],
  lra: [
    'LRA document uploaded',
    'Legal review complete',
  ],
  launch: [
    'Launch checklist complete',
    'Production approval obtained',
  ],
};

const FALLBACK_CRITERIA = ['Document uploaded', 'Review complete'];

function buildDefaultCriteria(nodeId: string): ValidationCriterion[] {
  const labels = DEFAULT_CRITERIA[nodeId] ?? FALLBACK_CRITERIA;
  return labels.map((label, i) => ({
    id: `${nodeId}-crit-${i}`,
    label,
    required: true,
    status: 'pending' as const,
  }));
}

// ─── All workflow node IDs ────────────────────────────────────────────────────

const ALL_NODE_IDS = [
  'project',
  'marketing-input',
  'revert-quotation',
  'acceptance',
  'proto-reports',
  'proto-retest',
  'n10-reports',
  'n10-retest',
  'reliability',
  'qra',
  're-reliability',
  'lra',
  'launch',
  'review',
  'reject',
  'end',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storageKey(projectId: string): string {
  return `workflow_${projectId}`;
}

function makeAuditEntry(
  action: string,
  userId: string,
  userName: string,
  details: string
): AuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    userId,
    userName,
    timestamp: new Date().toISOString(),
    details,
  };
}

function buildDefaultStage(nodeId: string): StageData {
  return {
    nodeId,
    status: 'idle',
    files: [],
    validationCriteria: buildDefaultCriteria(nodeId),
    reviewComment: '',
    auditTrail: [],
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const workflowService = {
  /** Load workflow state from localStorage, initialising defaults if missing */
  getWorkflowState(projectId: string): WorkflowState {
    const saved = storage.get<WorkflowState>(storageKey(projectId));
    if (saved?.stages) {
      // Ensure any newly-added nodes have default stage data
      const stages = { ...saved.stages };
      for (const id of ALL_NODE_IDS) {
        if (!stages[id]) stages[id] = buildDefaultStage(id);
      }
      return { ...saved, stages };
    }
    const stages: Record<string, StageData> = {};
    for (const id of ALL_NODE_IDS) {
      stages[id] = buildDefaultStage(id);
    }
    return { projectId, stages, lastSaved: new Date().toISOString() };
  },

  /** Persist the full workflow state */
  _save(state: WorkflowState): void {
    storage.set(storageKey(state.projectId), {
      ...state,
      lastSaved: new Date().toISOString(),
    });
  },

  /** Save stage data with an audit entry */
  saveStageData(
    projectId: string,
    nodeId: string,
    data: Partial<StageData>,
    userId: string,
    userName: string
  ): WorkflowState {
    const state = this.getWorkflowState(projectId);
    const existing = state.stages[nodeId] ?? buildDefaultStage(nodeId);
    const updated: StageData = {
      ...existing,
      ...data,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: userName,
    };
    state.stages[nodeId] = updated;
    this.addAuditEntry(projectId, nodeId, 'Stage Updated', userId, userName, 'Stage data saved');
    this._save(state);
    return this.getWorkflowState(projectId);
  },

  /** Upload a file (reads as base64 and stores in localStorage) */
  async uploadFile(
    projectId: string,
    nodeId: string,
    file: File,
    userId: string,
    userName: string
  ): Promise<WorkflowState> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    const state = this.getWorkflowState(projectId);
    const stage = state.stages[nodeId] ?? buildDefaultStage(nodeId);

    const uploaded: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: userName,
      uploadedAt: new Date().toISOString(),
      dataUrl,
    };

    stage.files = [...stage.files, uploaded];
    stage.status = stage.status === 'idle' ? 'uploaded' : stage.status;
    stage.lastModifiedAt = new Date().toISOString();
    stage.lastModifiedBy = userName;
    stage.auditTrail = [
      makeAuditEntry('File Uploaded', userId, userName, `Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`),
      ...stage.auditTrail,
    ];

    state.stages[nodeId] = stage;
    this._save(state);
    return this.getWorkflowState(projectId);
  },

  /** Delete a file from a stage */
  deleteFile(
    projectId: string,
    nodeId: string,
    fileId: string,
    userId: string,
    userName: string
  ): WorkflowState {
    const state = this.getWorkflowState(projectId);
    const stage = state.stages[nodeId] ?? buildDefaultStage(nodeId);
    const target = stage.files.find((f) => f.id === fileId);
    stage.files = stage.files.filter((f) => f.id !== fileId);
    if (stage.files.length === 0 && stage.status === 'uploaded') {
      stage.status = 'idle';
    }
    stage.lastModifiedAt = new Date().toISOString();
    stage.lastModifiedBy = userName;
    stage.auditTrail = [
      makeAuditEntry('File Deleted', userId, userName, `Deleted "${target?.name ?? fileId}"`),
      ...stage.auditTrail,
    ];
    state.stages[nodeId] = stage;
    this._save(state);
    return this.getWorkflowState(projectId);
  },

  /** Update a single validation criterion */
  updateValidationCriterion(
    projectId: string,
    nodeId: string,
    criterionId: string,
    status: 'pending' | 'pass' | 'fail',
    comment: string,
    userId: string,
    userName: string
  ): WorkflowState {
    const state = this.getWorkflowState(projectId);
    const stage = state.stages[nodeId] ?? buildDefaultStage(nodeId);
    stage.validationCriteria = stage.validationCriteria.map((c) =>
      c.id === criterionId ? { ...c, status, comment } : c
    );

    // Recalculate status
    const allRequired = stage.validationCriteria.filter((c) => c.required);
    const allPass = allRequired.every((c) => c.status === 'pass');
    const anyFail = stage.validationCriteria.some((c) => c.status === 'fail');
    const anyPass = stage.validationCriteria.some((c) => c.status === 'pass');

    if (stage.status !== 'approved' && stage.status !== 'rejected') {
      if (anyFail) stage.status = 'partial';
      else if (allPass) stage.status = 'uploaded';
      else if (anyPass) stage.status = 'partial';
    }

    stage.lastModifiedAt = new Date().toISOString();
    stage.lastModifiedBy = userName;
    stage.auditTrail = [
      makeAuditEntry(
        'Criterion Updated',
        userId,
        userName,
        `Criterion "${criterionId}" set to "${status}"${comment ? `: ${comment}` : ''}`
      ),
      ...stage.auditTrail,
    ];
    state.stages[nodeId] = stage;
    this._save(state);
    return this.getWorkflowState(projectId);
  },

  /** Approve a stage */
  approveStage(
    projectId: string,
    nodeId: string,
    userId: string,
    userName: string,
    comment: string
  ): WorkflowState {
    const state = this.getWorkflowState(projectId);
    const stage = state.stages[nodeId] ?? buildDefaultStage(nodeId);
    stage.status = 'approved';
    stage.approvedBy = userName;
    stage.approvedAt = new Date().toISOString();
    stage.reviewComment = comment;
    stage.lastModifiedAt = new Date().toISOString();
    stage.lastModifiedBy = userName;
    stage.auditTrail = [
      makeAuditEntry('Stage Approved', userId, userName, comment || 'Stage approved'),
      ...stage.auditTrail,
    ];
    state.stages[nodeId] = stage;
    this._save(state);
    return this.getWorkflowState(projectId);
  },

  /** Reject a stage */
  rejectStage(
    projectId: string,
    nodeId: string,
    userId: string,
    userName: string,
    comment: string
  ): WorkflowState {
    const state = this.getWorkflowState(projectId);
    const stage = state.stages[nodeId] ?? buildDefaultStage(nodeId);
    stage.status = 'rejected';
    stage.reviewComment = comment;
    stage.lastModifiedAt = new Date().toISOString();
    stage.lastModifiedBy = userName;
    stage.auditTrail = [
      makeAuditEntry('Stage Rejected', userId, userName, comment || 'Stage rejected'),
      ...stage.auditTrail,
    ];
    state.stages[nodeId] = stage;
    this._save(state);
    return this.getWorkflowState(projectId);
  },

  /** Get the current status of a stage */
  getStageStatus(projectId: string, nodeId: string): NodeStatus {
    const state = this.getWorkflowState(projectId);
    return state.stages[nodeId]?.status ?? 'idle';
  },

  /** Compute workflow-level metrics */
  getWorkflowMetrics(projectId: string): WorkflowMetrics {
    const state = this.getWorkflowState(projectId);
    const stages = Object.values(state.stages);
    const total = stages.length;
    const completed = stages.filter((s) => s.status === 'approved').length;
    const failed = stages.filter((s) => s.status === 'rejected').length;
    const pending = total - completed - failed;

    // Compliance: percentage of required criteria that are 'pass' across all stages
    let totalRequired = 0;
    let totalPassed = 0;
    for (const stage of stages) {
      for (const c of stage.validationCriteria) {
        if (c.required) {
          totalRequired++;
          if (c.status === 'pass') totalPassed++;
        }
      }
    }
    const compliancePercent = totalRequired > 0 ? Math.round((totalPassed / totalRequired) * 100) : 0;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, failed, compliancePercent, progressPercent };
  },

  /** Append an audit entry to a stage */
  addAuditEntry(
    projectId: string,
    nodeId: string,
    action: string,
    userId: string,
    userName: string,
    details: string
  ): void {
    const state = this.getWorkflowState(projectId);
    const stage = state.stages[nodeId] ?? buildDefaultStage(nodeId);
    stage.auditTrail = [
      makeAuditEntry(action, userId, userName, details),
      ...stage.auditTrail,
    ];
    state.stages[nodeId] = stage;
    this._save(state);
  },
};
