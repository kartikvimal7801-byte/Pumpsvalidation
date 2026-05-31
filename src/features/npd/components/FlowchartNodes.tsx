import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// ─── Shared handle style ─────────────────────────────────────────────────────
export const HS: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#0ea5e9',
  border: '2px solid #fff',
  zIndex: 10,
};

// ─── Node data shape shared by all types ─────────────────────────────────────
export interface FlowNodeData {
  label: string;
  description?: string;
  color?: string;          // hex background tint
  status?: 'pending' | 'approved' | 'rejected';
  variant?: 'start' | 'end'; // for oval only
  onContextMenu?: (id: string, e: React.MouseEvent) => void;
  nodeId?: string;
}

// ─── Process Node (rectangle) ────────────────────────────────────────────────
export const ProcessNode = memo(({ data, selected, id }: NodeProps<FlowNodeData>) => {
  const isCompleted = data.status === 'approved';
  const bg = isCompleted ? '#dcfce7' : (data.color ?? '#e0f2fe');
  const border = isCompleted ? '#22c55e' : (selected ? '#0ea5e9' : '#38bdf8');
  const statusRing =
    data.status === 'approved'
      ? 'ring-2 ring-green-400'
      : data.status === 'rejected'
      ? 'ring-2 ring-red-400'
      : '';

  return (
    <div
      className={`relative group min-w-[140px] max-w-[200px] rounded-md px-3 py-2 text-center shadow-sm transition-all cursor-pointer ${statusRing}`}
      style={{ background: bg, border: `2px solid ${border}` }}
      onContextMenu={(e) => { e.preventDefault(); data.onContextMenu?.(id, e); }}
    >
      <Handle type="target" position={Position.Top} style={HS} />
      <Handle type="target" position={Position.Left} style={HS} id="left-target" />
      <Handle type="target" position={Position.Right} style={HS} id="right-target" />

      <p className="text-xs font-semibold text-gray-800 leading-tight break-words">{data.label}</p>
      {data.description && (
        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight break-words line-clamp-2">
          {data.description}
        </p>
      )}
      {data.status && (
        <span
          className={`mt-1 inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
            data.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : data.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {data.status}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} style={HS} />
      <Handle type="source" position={Position.Right} style={HS} id="right-source" />
      <Handle type="source" position={Position.Left} style={HS} id="left-source" />
    </div>
  );
});
ProcessNode.displayName = 'ProcessNode';

// ─── Decision Node (diamond) ─────────────────────────────────────────────────
export const DecisionNode = memo(({ data, selected, id }: NodeProps<FlowNodeData>) => {
  const isCompleted = data.status === 'approved';
  const bg = isCompleted ? '#dcfce7' : (data.color ?? '#e0f2fe');
  const border = isCompleted ? '#22c55e' : (selected ? '#0ea5e9' : '#38bdf8');

  return (
    <div
      className="relative group"
      style={{ width: 130, height: 90 }}
      onContextMenu={(e) => { e.preventDefault(); data.onContextMenu?.(id, e); }}
    >
      {/* Diamond */}
      <div
        className="absolute inset-0"
        style={{
          background: bg,
          border: `2px solid ${border}`,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />

      {/* Handles at diamond tips */}
      <Handle type="target" position={Position.Top}
        style={{ ...HS, top: 0, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Bottom} id="yes"
        style={{ ...HS, bottom: 0, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Left} id="no"
        style={{ ...HS, left: 0, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right"
        style={{ ...HS, right: 0, top: '50%', transform: 'translateY(-50%)' }} />

      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pointer-events-none">
        <span className="text-xs font-semibold text-gray-800 text-center leading-tight break-words">
          {data.label}
        </span>
      </div>
    </div>
  );
});
DecisionNode.displayName = 'DecisionNode';

// ─── Oval Node (start / end / milestone) ─────────────────────────────────────
export const OvalNode = memo(({ data, selected, id }: NodeProps<FlowNodeData>) => {
  const isCompleted = data.status === 'approved';
  const bg = isCompleted ? '#dcfce7' : (data.color ?? (data.variant === 'end' ? '#e0f2fe' : '#e0f2fe'));
  const border = isCompleted ? '#22c55e' : (selected ? '#0ea5e9' : '#38bdf8');

  return (
    <div
      className="relative group flex items-center justify-center min-w-[110px] h-11 rounded-full px-4 shadow-sm transition-all cursor-pointer"
      style={{ background: bg, border: `2px solid ${border}` }}
      onContextMenu={(e) => { e.preventDefault(); data.onContextMenu?.(id, e); }}
    >
      <Handle type="target" position={Position.Top} style={HS} />
      <Handle type="target" position={Position.Left} style={HS} id="left-target" />

      <span className="text-xs font-bold text-gray-800 text-center leading-tight">{data.label}</span>

      <Handle type="source" position={Position.Bottom} style={HS} />
      <Handle type="source" position={Position.Right} style={HS} id="right-source" />
    </div>
  );
});
OvalNode.displayName = 'OvalNode';

// ─── Milestone Node (hexagon-ish rounded rect with accent) ───────────────────
export const MilestoneNode = memo(({ data, selected, id }: NodeProps<FlowNodeData>) => {
  const isCompleted = data.status === 'approved';
  const bg = isCompleted ? '#dcfce7' : (data.color ?? '#e0f2fe');
  const border = isCompleted ? '#22c55e' : (selected ? '#0ea5e9' : '#38bdf8');

  return (
    <div
      className="relative group flex flex-col items-center justify-center min-w-[140px] max-w-[200px] rounded-xl px-3 py-2 shadow-sm transition-all cursor-pointer text-center"
      style={{ background: bg, border: `2px solid ${border}` }}
      onContextMenu={(e) => { e.preventDefault(); data.onContextMenu?.(id, e); }}
    >
      <Handle type="target" position={Position.Top} style={HS} />
      <Handle type="target" position={Position.Left} style={HS} id="left-target" />

      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-0.5">
        Milestone
      </span>
      <p className="text-xs font-semibold text-gray-800 leading-tight break-words">{data.label}</p>
      {data.description && (
        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight break-words line-clamp-2">
          {data.description}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} style={HS} />
      <Handle type="source" position={Position.Right} style={HS} id="right-source" />
    </div>
  );
});
MilestoneNode.displayName = 'MilestoneNode';
