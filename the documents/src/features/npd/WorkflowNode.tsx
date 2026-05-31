import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeStatus } from '@/services/workflowService';

// ─── Node data shape ──────────────────────────────────────────────────────────
export interface WorkflowNodeData {
  label: string;
  nodeStatus: NodeStatus;
  fileCount: number;
  passedCriteria: number;
  totalCriteria: number;
  lastModified?: string;
  variant?: 'start' | 'end';
  accentColor?: string;
}

// ─── Per-status accent colours ────────────────────────────────────────────────
// All idle/uploaded/partial nodes use the same teal. Only approved→green, rejected→red.
function resolveColors(nodeStatus: NodeStatus, _accent: string) {
  if (nodeStatus === 'approved') return { header: '#16a34a', body: '#f0fdf4', border: '#22c55e' };
  if (nodeStatus === 'rejected') return { header: '#dc2626', body: '#fef2f2', border: '#ef4444' };
  // All other states → uniform teal
  const teal = '#1a7a8a';
  return { header: teal, body: '#e0f7fa', border: teal };
}

// ─── Handle style ─────────────────────────────────────────────────────────────
const HS: React.CSSProperties = {
  width: 10,
  height: 10,
  background: '#475569',
  border: '2px solid #fff',
  zIndex: 10,
};

// ─── Status badge text ────────────────────────────────────────────────────────
function statusBadge(s: NodeStatus): string {
  if (s === 'approved') return '✓ Approved';
  if (s === 'rejected') return '✗ Rejected';
  if (s === 'uploaded') return '↑ Under Review';
  if (s === 'partial')  return '~ Partial';
  return '';
}

// ─── Process Node — card with coloured header + tinted body ──────────────────
export const WorkflowProcessNode = memo(({ data }: NodeProps<WorkflowNodeData>) => {
  const accent = data.accentColor ?? '#1a7a8a';
  const { header, body, border } = resolveColors(data.nodeStatus, accent);
  const [hovered, setHovered] = useState(false);
  const badge = statusBadge(data.nodeStatus);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 200,
        background: body,
        border: `2.5px solid ${border}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: hovered
          ? `0 10px 28px rgba(0,0,0,0.18), 0 0 0 3px ${header}30`
          : '0 3px 10px rgba(0,0,0,0.10)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'none',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top}    style={HS} />
      <Handle type="target" position={Position.Left}   style={HS} id="left-target" />
      <Handle type="target" position={Position.Right}  style={HS} id="right-target" />
      <Handle type="target" position={Position.Bottom} style={HS} id="bottom-target" />

      {/* ── Coloured header bar ── */}
      <div style={{
        background: header,
        padding: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 42,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.3,
          flex: 1,
          letterSpacing: 0.1,
        }}>
          {data.label}
        </span>
        {data.nodeStatus !== 'idle' && (
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: '#ffffff',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 4,
            padding: '2px 5px',
            flexShrink: 0,
            marginLeft: 6,
          }}>
            {data.nodeStatus === 'approved' ? '✓' :
             data.nodeStatus === 'rejected' ? '✗' :
             data.nodeStatus === 'uploaded' ? '↑' : '~'}
          </span>
        )}
      </div>

      {/* ── Tinted body ── */}
      <div style={{ padding: '8px 14px 10px', minHeight: 32 }}>
        {badge ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: header }}>
            {badge}
          </span>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
            Click to open
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={HS} />
      <Handle type="source" position={Position.Right}  style={HS} id="right-source" />
      <Handle type="source" position={Position.Left}   style={HS} id="left-source" />
      <Handle type="source" position={Position.Top}    style={HS} id="top-source" />
    </div>
  );
});
WorkflowProcessNode.displayName = 'WorkflowProcessNode';

// ─── Decision Node — diamond with coloured fill ───────────────────────────────
export const WorkflowDecisionNode = memo(({ data }: NodeProps<WorkflowNodeData>) => {
  const accent = data.accentColor ?? '#7c3aed';
  const { header } = resolveColors(data.nodeStatus, accent);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 150,
        height: 100,
        transform: hovered ? 'scale(1.04)' : 'none',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
        userSelect: 'none',
        filter: hovered
          ? 'drop-shadow(0 8px 18px rgba(0,0,0,0.20))'
          : 'drop-shadow(0 3px 7px rgba(0,0,0,0.12))',
      }}
    >
      {/* Diamond fill */}
      <div style={{
        position: 'absolute', inset: 0,
        background: header,
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        transition: 'background 0.18s ease',
      }} />

      <Handle type="target" position={Position.Top}
        style={{ ...HS, top: 0, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Bottom} id="yes"
        style={{ ...HS, bottom: 0, left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Left} id="no"
        style={{ ...HS, left: 0, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" position={Position.Right} id="right"
        style={{ ...HS, right: 0, top: '50%', transform: 'translateY(-50%)' }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px', pointerEvents: 'none',
      }}>
        <span style={{
          fontSize: 12, fontWeight: 800,
          color: '#ffffff', textAlign: 'center', lineHeight: 1.3,
        }}>
          {data.label}
        </span>
      </div>
    </div>
  );
});
WorkflowDecisionNode.displayName = 'WorkflowDecisionNode';

// ─── Oval Node — pill (start / end) ──────────────────────────────────────────
export const WorkflowOvalNode = memo(({ data }: NodeProps<WorkflowNodeData>) => {
  const isEnd = data.variant === 'end';
  const [hovered, setHovered] = useState(false);
  const bg    = isEnd ? '#dc2626' : '#16a34a';
  const bgHov = isEnd ? '#b91c1c' : '#15803d';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 160,
        height: 50,
        background: hovered ? bgHov : bg,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hovered ? '0 8px 20px rgba(0,0,0,0.18)' : '0 3px 8px rgba(0,0,0,0.12)',
        transform: hovered ? 'scale(1.04)' : 'none',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top}   style={HS} />
      <Handle type="target" position={Position.Left}  style={HS} id="left-target" />
      <Handle type="target" position={Position.Right} style={HS} id="right-target" />

      <span style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', letterSpacing: 0.3 }}>
        {data.label}
      </span>

      <Handle type="source" position={Position.Bottom} style={HS} />
      <Handle type="source" position={Position.Right}  style={HS} id="right-source" />
      <Handle type="source" position={Position.Left}   style={HS} id="left-source" />
    </div>
  );
});
WorkflowOvalNode.displayName = 'WorkflowOvalNode';
