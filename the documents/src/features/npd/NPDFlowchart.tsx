import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, Panel,
  addEdge, useNodesState, useEdgesState,
  Connection, Edge, Node, ReactFlowProvider,
  ReactFlowInstance, MarkerType, useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ProcessNode, DecisionNode, OvalNode, MilestoneNode, FlowNodeData } from './FlowchartNodes';
import { storage } from '@/utils';
import {
  Save, RotateCcw, CheckCircle, ZoomIn, ZoomOut, Maximize2,
  Square, Diamond, Circle, Star, Trash2, Copy, Palette, FileText,
  X, Check,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type NodeKind = 'process' | 'decision' | 'oval' | 'milestone';

interface ContextMenu {
  nodeId: string;
  x: number;
  y: number;
}

interface EditPanel {
  nodeId: string;
  label: string;
  description: string;
  color: string;
  status: string;
}

// ─── Edge / marker defaults ───────────────────────────────────────────────────
const ES = { stroke: '#38bdf8', strokeWidth: 3 };
const ME = { type: MarkerType.ArrowClosed, color: '#38bdf8', width: 20, height: 20 };

// ─── Colour palette ───────────────────────────────────────────────────────────
const COLORS = [
  '#ffffff', '#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3',
  '#ede9fe', '#ffedd5', '#f1f5f9', '#d1fae5', '#fee2e2',
];

// ─── Default Havells NPD flowchart ────────────────────────────────────────────
function buildDefaultNodes(
  onCtx: (id: string, e: React.MouseEvent) => void
): Node<FlowNodeData>[] {
  const d = (id: string, label: string, type: NodeKind, x: number, y: number,
    extra: Partial<FlowNodeData> = {}): Node<FlowNodeData> => ({
    id, type, position: { x, y },
    data: { label, onContextMenu: onCtx, nodeId: id, ...extra },
  });
  return [
    d('project',          'Project',                   'oval',      430, 20,  { variant: 'start' }),
    d('marketing-input',  'Marketing Input / RFQ',     'process',   370, 110),
    d('revert-quotation', 'Revert Against Quotation',  'process',   360, 200),
    d('acceptance',       'Acceptance',                'decision',  400, 305),
    d('proto-reports',    'Proto Reports',             'process',   210, 305),
    d('proto-retest',     'Proto Re-Test Reports',     'process',   210, 400),
    d('n10-reports',      'N10 Reports',               'process',    50, 400),
    d('n10-retest',       'N10 Re-Test Reports',       'process',   140, 495),
    d('reliability',      'Reliability',               'process',   -70, 495),
    d('qra',              'QRA',                       'process',  -110, 590),
    d('re-reliability',   'Re-Reliability',            'process',    50, 590),
    d('lra',              'LRA',                       'process',  -110, 680),
    d('launch',           'Launch',                    'process',  -110, 770),
    d('review',           'Review',                    'process',   610, 305),
    d('reject',           'Reject',                    'process',   650, 495),
    d('end',              'End',                       'oval',      650, 590, { variant: 'end' }),
  ];
}

function buildDefaultEdges(): Edge[] {
  const e = (id: string, source: string, target: string,
    label = '', sh?: string, dashed = false): Edge => ({
    id, source, target,
    ...(sh ? { sourceHandle: sh } : {}),
    label,
    labelStyle: { fontSize: 10, fontWeight: 700, fill: '#38bdf8' },
    style: dashed ? { ...ES, strokeDasharray: '5,3' } : ES,
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
    e('e9',  'reliability',      'qra',              'YES'),
    e('e10', 'reliability',      're-reliability',   'NO',  'right-source'),
    e('e11', 'qra',              'lra'),
    e('e12', 'lra',              'launch'),
    e('e13', 'acceptance',       'review',           'NO',  'right'),
    e('e14', 'review',           'revert-quotation', 'YES', 'right-source', true),
    e('e15', 'review',           'reject',           'NO'),
    e('e16', 'reject',           'end'),
  ];
}

// ─── Node type registry (stable reference — must be outside component) ────────
const NODE_TYPES = {
  process:   ProcessNode,
  decision:  DecisionNode,
  oval:      OvalNode,
  milestone: MilestoneNode,
};

// ─── Inner canvas ─────────────────────────────────────────────────────────────
function FlowchartCanvas({ projectId }: { projectId: string }) {
  const storageKey = `flowchart_v2_${projectId}`;
  const rfInstance = useRef<ReactFlowInstance | null>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // ── Context menu callback ref (stable) ────────────────────────────────────
  const ctxRef = useRef<(id: string, e: React.MouseEvent) => void>(() => {});

  // ── Load / build initial state ────────────────────────────────────────────
  const buildInitial = useCallback(() => {
    const saved = storage.get<{ nodes: Node[]; edges: Edge[] }>(storageKey);
    if (saved?.nodes?.length) {
      const nodes = saved.nodes.map((n) => ({
        ...n,
        data: { ...n.data, onContextMenu: (id: string, ev: React.MouseEvent) => ctxRef.current(id, ev), nodeId: n.id },
      }));
      return { nodes, edges: saved.edges };
    }
    return {
      nodes: buildDefaultNodes((id, ev) => ctxRef.current(id, ev)),
      edges: buildDefaultEdges(),
    };
  }, [storageKey]);

  const initial = buildInitial();
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [editPanel, setEditPanel] = useState<EditPanel | null>(null);

  // ── Wire context menu callback ────────────────────────────────────────────
  ctxRef.current = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ nodeId: id, x: e.clientX, y: e.clientY });
  }, []);

  // ── Keep node data callbacks fresh after setNodes ─────────────────────────
  const refreshCallbacks = useCallback((nds: Node[]) =>
    nds.map((n) => ({
      ...n,
      data: { ...n.data, onContextMenu: (id: string, ev: React.MouseEvent) => ctxRef.current(id, ev), nodeId: n.id },
    })), []);

  // ── Connect ───────────────────────────────────────────────────────────────
  const onConnect = useCallback((params: Connection) =>
    setEdges((eds) => addEdge({ ...params, style: ES, markerEnd: ME, type: 'smoothstep' }, eds)),
  [setEdges]);

  // ── Auto-save (debounced 2 s) ─────────────────────────────────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doSave = useCallback((nds: Node[], eds: Edge[]) => {
    const clean = nds.map(({ data, ...rest }) => ({
      ...rest,
      data: { label: data.label, description: data.description, color: data.color, status: data.status, variant: data.variant },
    }));
    storage.set(storageKey, { nodes: clean, edges: eds });
  }, [storageKey]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(nodes, edges), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [nodes, edges, doSave]);

  // ── Manual save ───────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    doSave(nodes, edges);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [nodes, edges, doSave]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (!confirm('Reset to default Havells NPD workflow? All changes will be lost.')) return;
    storage.remove(storageKey);
    const fresh = buildDefaultNodes((id, ev) => ctxRef.current(id, ev));
    const freshEdges = buildDefaultEdges();
    setNodes(fresh);
    setEdges(freshEdges);
    setTimeout(() => fitView({ padding: 0.15 }), 60);
  }, [storageKey, setNodes, setEdges, fitView]);

  // ── Add node ──────────────────────────────────────────────────────────────
  const addNode = useCallback((type: NodeKind) => {
    const id = `node-${Date.now()}`;
    const vp = rfInstance.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 };
    const x = (-vp.x + 500) / vp.zoom;
    const y = (-vp.y + 350) / vp.zoom;
    const labels: Record<NodeKind, string> = {
      process: 'New Step', decision: 'Decision?', oval: 'Start / End', milestone: 'Milestone',
    };
    setNodes((nds) => refreshCallbacks([...nds, {
      id, type, position: { x, y },
      data: { label: labels[type], onContextMenu: (nid: string, ev: React.MouseEvent) => ctxRef.current(nid, ev), nodeId: id,
        ...(type === 'oval' ? { variant: 'start' as const } : {}) },
    }]));
  }, [setNodes, refreshCallbacks]);

  // ── Delete selected ───────────────────────────────────────────────────────
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
    setContextMenu(null);
  }, [setNodes, setEdges]);

  // ── Context menu actions ──────────────────────────────────────────────────
  const openEditPanel = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setEditPanel({
      nodeId,
      label: node.data.label ?? '',
      description: node.data.description ?? '',
      color: node.data.color ?? '#ffffff',
      status: node.data.status ?? '',
    });
    setContextMenu(null);
  }, [nodes]);

  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const newId = `node-${Date.now()}`;
    setNodes((nds) => refreshCallbacks([...nds, {
      ...node,
      id: newId,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      selected: false,
      data: { ...node.data, nodeId: newId },
    }]));
    setContextMenu(null);
  }, [nodes, setNodes, refreshCallbacks]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setContextMenu(null);
  }, [setNodes, setEdges]);

  // ── Apply edit panel ──────────────────────────────────────────────────────
  const applyEdit = useCallback(() => {
    if (!editPanel) return;
    setNodes((nds) => refreshCallbacks(nds.map((n) =>
      n.id === editPanel.nodeId
        ? { ...n, data: { ...n.data, label: editPanel.label, description: editPanel.description,
            color: editPanel.color, status: editPanel.status || undefined } }
        : n
    )));
    setEditPanel(null);
  }, [editPanel, setNodes, refreshCallbacks]);

  // ── Keyboard delete ───────────────────────────────────────────────────────
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && (e.target as HTMLElement).tagName !== 'INPUT') {
      deleteSelected();
    }
    if (e.key === 'Escape') { setContextMenu(null); setEditPanel(null); }
  }, [deleteSelected]);

  return (
    <div className="w-full h-full outline-none relative" tabIndex={0} onKeyDown={onKeyDown}
      onClick={() => { setContextMenu(null); }}>

      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(inst) => { rfInstance.current = inst; inst.fitView({ padding: 0.15 }); }}
        nodeTypes={NODE_TYPES}
        fitView fitViewOptions={{ padding: 0.15 }}
        deleteKeyCode={null}
        snapToGrid snapGrid={[10, 10]}
        defaultEdgeOptions={{ style: ES, markerEnd: ME, type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => n.type === 'decision' ? '#bae6fd' : n.type === 'oval' ? '#dcfce7' : n.type === 'milestone' ? '#fef3c7' : '#f1f5f9'}
          maskColor="rgba(0,0,0,0.04)"
          style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
        />

        {/* ── Left toolbar: add nodes ──────────────────────────────────── */}
        <Panel position="top-left">
          <div className="flex flex-col gap-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[130px]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Add Node</p>
            {([
              ['process',   'Process',   <Square   key="sq" className="h-3.5 w-3.5" />],
              ['decision',  'Decision',  <Diamond  key="di" className="h-3.5 w-3.5" />],
              ['oval',      'Oval',      <Circle   key="ci" className="h-3.5 w-3.5" />],
              ['milestone', 'Milestone', <Star     key="st" className="h-3.5 w-3.5" />],
            ] as [NodeKind, string, React.ReactNode][]).map(([type, label, icon]) => (
              <button key={type} onClick={() => addNode(type)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg transition-colors">
                <span className="text-[#1a7a8a]">{icon}</span>{label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-1" />
            <button onClick={deleteSelected}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          </div>
        </Panel>

        {/* ── Top-right: zoom + save ───────────────────────────────────── */}
        <Panel position="top-right">
          <div className="flex items-center gap-2">
            <button onClick={() => zoomOut()} title="Zoom out"
              className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </button>
            <button onClick={() => zoomIn()} title="Zoom in"
              className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </button>
            <button onClick={() => fitView({ padding: 0.15 })} title="Fit to screen"
              className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <Maximize2 className="h-4 w-4 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-colors">
              <RotateCcw className="h-3.5 w-3.5" />Reset
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                saveStatus === 'saved' ? 'bg-green-500 text-white border border-green-500' : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white border border-[#0ea5e9]'}`}>
              {saveStatus === 'saved' ? <><CheckCircle className="h-3.5 w-3.5" />Saved</> : <><Save className="h-3.5 w-3.5" />Save</>}
            </button>
          </div>
        </Panel>

        {/* ── Bottom hint ──────────────────────────────────────────────── */}
        <Panel position="bottom-center">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1 text-[11px] text-gray-400 shadow-sm">
            Right-click a node to edit · Drag handles to connect · Select + Delete to remove · Auto-saves every 2 s
          </div>
        </Panel>
      </ReactFlow>

      {/* ── Context menu ──────────────────────────────────────────────────── */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => openEditPanel(contextMenu.nodeId)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <FileText className="h-4 w-4 text-gray-400" />Edit Details
          </button>
          <button onClick={() => duplicateNode(contextMenu.nodeId)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Copy className="h-4 w-4 text-gray-400" />Duplicate
          </button>
          <button onClick={() => { openEditPanel(contextMenu.nodeId); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Palette className="h-4 w-4 text-gray-400" />Change Color
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button onClick={() => deleteNode(contextMenu.nodeId)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="h-4 w-4" />Delete Node
          </button>
        </div>
      )}

      {/* ── Edit panel (slide-in from right) ──────────────────────────────── */}
      {editPanel && (
        <div className="absolute top-0 right-0 h-full w-72 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Edit Node</h3>
            <button onClick={() => setEditPanel(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Node Name</label>
              <input value={editPanel.label}
                onChange={(e) => setEditPanel((p) => p ? { ...p, label: e.target.value } : p)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Node name" />
            </div>
            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea value={editPanel.description}
                onChange={(e) => setEditPanel((p) => p ? { ...p, description: e.target.value } : p)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="Optional description..." />
            </div>
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select value={editPanel.status}
                onChange={(e) => setEditPanel((p) => p ? { ...p, status: e.target.value } : p)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">— None —</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Background Color</label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setEditPanel((p) => p ? { ...p, color: c } : p)}
                    className={`w-9 h-9 rounded-lg border-2 transition-all ${editPanel.color === c ? 'border-blue-500 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                    style={{ background: c }} title={c} />
                ))}
              </div>
              <input type="color" value={editPanel.color}
                onChange={(e) => setEditPanel((p) => p ? { ...p, color: e.target.value } : p)}
                className="mt-2 w-full h-8 rounded border border-gray-300 cursor-pointer" />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <button onClick={() => setEditPanel(null)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={applyEdit}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg transition-colors">
              <Check className="h-4 w-4" />Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function NPDFlowchart({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <FlowchartCanvas projectId={projectId} />
    </ReactFlowProvider>
  );
}
