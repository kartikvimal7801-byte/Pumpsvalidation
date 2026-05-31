import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  Node,
  Edge,
  NodeMouseHandler,
  ReactFlowProvider,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  WorkflowProcessNode,
  WorkflowDecisionNode,
  WorkflowOvalNode,
  WorkflowNodeData,
} from './WorkflowNode';
import StagePanel from './StagePanel';
import DocumentsPanel from './DocumentsPanel';
import WorkflowMetrics from './WorkflowMetrics';
import { workflowService, WorkflowState, NodeStatus } from '@/services/workflowService';
import { ZoomIn, ZoomOut, Maximize2, FolderOpen } from 'lucide-react';

// ─── Node type registry ───────────────────────────────────────────────────────
const NODE_TYPES = {
  workflowProcess:  WorkflowProcessNode,
  workflowDecision: WorkflowDecisionNode,
  workflowOval:     WorkflowOvalNode,
};

// ─── Edge defaults — thick filled arrows matching the image ───────────────────
const TEAL = '#1a7a8a';
const ES   = { stroke: TEAL, strokeWidth: 3 };
const ME   = { type: MarkerType.ArrowClosed, color: TEAL, width: 22, height: 22 };

// ─── Per-node accent colours ──────────────────────────────────────────────────
const NODE_ACCENT: Record<string, string> = {
  'project':          '#16a34a',
  'marketing-input':  '#ea580c',
  'revert-quotation': '#ea580c',
  'acceptance':       '#7c3aed',
  'proto-reports':    '#2563eb',
  'proto-retest':     '#2563eb',
  'n10-reports':      '#0891b2',
  'n10-retest':       '#0891b2',
  'reliability':      '#7c3aed',
  'qra':              '#d97706',
  're-reliability':   '#7c3aed',
  'lra':              '#d97706',
  'launch':           '#16a34a',
  'review':           '#2563eb',
  'reject':           '#dc2626',
  'end':              '#dc2626',
};

// ─── Node labels ──────────────────────────────────────────────────────────────
const NODE_LABELS: Record<string, string> = {
  'project':          'Project',
  'marketing-input':  'Marketing Input / RFQ',
  'revert-quotation': 'Revert Against Quotation',
  'acceptance':       'Acceptance',
  'proto-reports':    'Proto Reports',
  'proto-retest':     'Proto Re-Test Reports',
  'n10-reports':      'N10 Reports',
  'n10-retest':       'N10 Re-Test Reports',
  'reliability':      'Reliability',
  'qra':              'QRA',
  're-reliability':   'Re-Reliability',
  'lra':              'LRA',
  'launch':           'Launch',
  'review':           'Review',
  'reject':           'Reject',
  'end':              'End',
};

// ─── Layout — same topology as the reference image, stretched horizontally ────
const POSITIONS: Record<string, { x: number; y: number }> = {
  'project':          { x:  530, y:    0 },
  'marketing-input':  { x:  505, y:  130 },
  'revert-quotation': { x:  505, y:  260 },
  'acceptance':       { x:  530, y:  390 },

  'proto-reports':    { x:  310, y:  390 },
  'proto-retest':     { x:  310, y:  520 },
  'n10-reports':      { x:   90, y:  390 },
  'n10-retest':       { x:   90, y:  520 },
  'reliability':      { x: -150, y:  390 },
  'qra':              { x: -370, y:  390 },
  're-reliability':   { x: -150, y:  520 },
  'lra':              { x: -370, y:  520 },
  'launch':           { x: -370, y:  650 },

  'review':           { x:  820, y:  390 },
  'reject':           { x:  820, y:  650 },
  'end':              { x:  820, y:  780 },
};

const TYPE_MAP: Record<string, 'workflowProcess' | 'workflowDecision' | 'workflowOval'> = {
  'project':          'workflowOval',
  'marketing-input':  'workflowProcess',
  'revert-quotation': 'workflowProcess',
  'acceptance':       'workflowDecision',
  'proto-reports':    'workflowProcess',
  'proto-retest':     'workflowProcess',
  'n10-reports':      'workflowProcess',
  'n10-retest':       'workflowProcess',
  'reliability':      'workflowProcess',
  'qra':              'workflowProcess',
  're-reliability':   'workflowProcess',
  'lra':              'workflowProcess',
  'launch':           'workflowProcess',
  'review':           'workflowProcess',
  'reject':           'workflowProcess',
  'end':              'workflowOval',
};

const VARIANT_MAP: Record<string, 'start' | 'end' | undefined> = {
  'project': 'start',
  'end':     'end',
};

// ─── Build nodes ──────────────────────────────────────────────────────────────
function buildNodes(state: WorkflowState): Node<WorkflowNodeData>[] {
  return Object.keys(POSITIONS).map((id) => {
    const stage = state.stages[id];
    const status: NodeStatus = stage?.status ?? 'idle';
    const passedCriteria = stage?.validationCriteria.filter((c) => c.status === 'pass').length ?? 0;
    const totalCriteria  = stage?.validationCriteria.length ?? 0;

    return {
      id,
      type: TYPE_MAP[id] ?? 'workflowProcess',
      position: POSITIONS[id],
      draggable: false,
      selectable: true,
      data: {
        label:        NODE_LABELS[id] ?? id,
        nodeStatus:   status,
        fileCount:    stage?.files?.length ?? 0,
        passedCriteria,
        totalCriteria,
        lastModified: stage?.lastModifiedAt,
        variant:      VARIANT_MAP[id],
        accentColor:  NODE_ACCENT[id],
      },
    };
  });
}

// ─── Edges ────────────────────────────────────────────────────────────────────
function buildEdges(): Edge[] {
  const e = (
    id: string, source: string, target: string,
    label = '', sh?: string, th?: string, dashed = false
  ): Edge => ({
    id, source, target,
    ...(sh ? { sourceHandle: sh } : {}),
    ...(th ? { targetHandle: th } : {}),
    label,
    labelStyle: { fontSize: 11, fontWeight: 800, fill: TEAL },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
    labelBgPadding: [4, 2] as [number, number],
    style: {
      stroke: TEAL,
      strokeWidth: 3,
      ...(dashed ? { strokeDasharray: '8,5' } : {}),
    },
    markerEnd: ME,
    type: 'smoothstep',
  });

  return [
    e('e1',  'project',          'marketing-input'),
    e('e2',  'marketing-input',  'revert-quotation'),
    e('e3',  'revert-quotation', 'acceptance'),
    e('e4',  'acceptance',       'proto-reports',    'YES', 'no'),
    e('e5',  'proto-reports',    'proto-retest',     'NO'),
    e('e6',  'proto-reports',    'n10-reports',      'YES', 'left-source'),
    e('e7',  'n10-reports',      'n10-retest',       'NO'),
    e('e8',  'n10-reports',      'reliability',      'YES', 'left-source'),
    e('e9',  'reliability',      'qra',              'YES', 'left-source'),
    e('e10', 'reliability',      're-reliability',   'NO'),
    e('e11', 'qra',              'lra'),
    e('e12', 'lra',              'launch'),
    e('e13', 'acceptance',       'review',           'NO',  'right'),
    e('e14', 'review',           'revert-quotation', 'YES', 'right-source', 'right-target', true),
    e('e15', 'review',           'reject',           'NO'),
    e('e16', 'reject',           'end'),
  ];
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { color: TEAL,      label: 'Pending' },
    { color: '#2563eb', label: 'Under Review' },
    { color: '#16a34a', label: 'Approved' },
    { color: '#d97706', label: 'Needs Correction' },
    { color: '#dc2626', label: 'Rejected' },
  ];
  return (
    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 shadow-md">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: color, border: `2px solid ${color}` }} />
          <span className="text-[11px] font-bold text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
function WorkflowCanvas({ projectId }: { projectId: string }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const FIXED_EDGES = useRef(buildEdges()).current;

  const [workflowState, setWorkflowState] = useState<WorkflowState>(() =>
    workflowService.getWorkflowState(projectId)
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDocs, setShowDocs] = useState(false);

  const refreshState = useCallback(() => {
    setWorkflowState(workflowService.getWorkflowState(projectId));
  }, [projectId]);

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const nodes = buildNodes(workflowState);
  const metrics = workflowService.getWorkflowMetrics(projectId);
  const selectedStage = selectedNodeId ? workflowState.stages[selectedNodeId] : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedNodeId(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <WorkflowMetrics metrics={metrics} lastSaved={workflowState.lastSaved} />

      <div className="flex-1 relative min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={FIXED_EDGES}
          nodeTypes={NODE_TYPES}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={true}
          zoomOnScroll={true}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.05}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ style: ES, markerEnd: ME, type: 'smoothstep' }}
          selectionOnDrag={false}
        >
          <Background color="#f8fafc" gap={24} size={1} />
          <Controls showInteractive={false} />

          <Panel position="top-right">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-md p-1.5">
              <button onClick={() => zoomOut()} title="Zoom out"
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ZoomOut className="h-4 w-4 text-gray-600" />
              </button>
              <button onClick={() => zoomIn()} title="Zoom in"
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </button>
              <div className="w-px h-5 bg-gray-200" />
              <button onClick={() => fitView({ padding: 0.08 })} title="Fit to screen"
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <Maximize2 className="h-4 w-4 text-gray-600" />
              </button>
              <div className="w-px h-5 bg-gray-200" />
              <button
                onClick={() => { setShowDocs(true); setSelectedNodeId(null); }}
                title="All Documents"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a7a8a] hover:bg-[#155f6e] text-white transition-colors text-xs font-semibold"
              >
                <FolderOpen className="h-4 w-4" />
                Documents
              </button>
            </div>
          </Panel>

          <Panel position="bottom-center">
            <Legend />
          </Panel>
        </ReactFlow>

        {selectedNodeId && selectedStage && !showDocs && (
          <StagePanel
            projectId={projectId}
            nodeId={selectedNodeId}
            nodeLabel={NODE_LABELS[selectedNodeId] ?? selectedNodeId}
            stageData={selectedStage}
            onClose={() => setSelectedNodeId(null)}
            onDataChange={refreshState}
          />
        )}

        {showDocs && (
          <DocumentsPanel
            projectId={projectId}
            nodeLabels={NODE_LABELS}
            onClose={() => setShowDocs(false)}
            onDataChange={refreshState}
          />
        )}
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function NPDWorkflow({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas projectId={projectId} />
    </ReactFlowProvider>
  );
}
