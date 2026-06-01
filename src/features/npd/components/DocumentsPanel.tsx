import { useState } from 'react';
import { X, Download, Trash2, FolderOpen, Search } from 'lucide-react';
import { workflowService, UploadedFile } from '@/services/workflowService';
import { useAuth } from '@/features/auth/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentEntry extends UploadedFile {
  stageId: string;
  stageLabel: string;
}

interface DocumentsPanelProps {
  projectId: string;
  nodeLabels: Record<string, string>;
  onClose: () => void;
  onDataChange: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fileIcon(type: string): string {
  if (type.includes('pdf'))   return '📄';
  if (type.includes('word') || type.includes('docx')) return '📝';
  if (type.includes('sheet') || type.includes('xlsx')) return '📊';
  if (type.includes('presentation') || type.includes('pptx')) return '📋';
  if (type.includes('image')) return '🖼️';
  return '📎';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsPanel({
  projectId,
  nodeLabels,
  onClose,
  onDataChange,
}: DocumentsPanelProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  const userId   = user?.id ?? 'unknown';
  const userName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username
    : 'Unknown User';

  // ── Collect all files across all stages ───────────────────────────────────
  const state = workflowService.getWorkflowState(projectId);
  const allDocs: DocumentEntry[] = [];

  for (const [stageId, stageData] of Object.entries(state.stages)) {
    for (const file of stageData.files) {
      allDocs.push({
        ...file,
        stageId,
        stageLabel: nodeLabels[stageId] ?? stageId,
      });
    }
  }

  // Sort newest first
  allDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = allDocs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.stageLabel.toLowerCase().includes(search.toLowerCase());
    const matchStage  = filterStage === 'all' || d.stageId === filterStage;
    return matchSearch && matchStage;
  });

  // ── Stages that have files (for filter dropdown) ──────────────────────────
  const stagesWithFiles = [...new Set(allDocs.map((d) => d.stageId))];

  // ── Download ──────────────────────────────────────────────────────────────
  const downloadFile = (file: UploadedFile) => {
    const byteString = atob(file.dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: file.type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteFile = (stageId: string, fileId: string) => {
    workflowService.deleteFile(projectId, stageId, fileId, userId, userName);
    onDataChange();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="absolute top-0 right-0 h-full w-[520px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-[#1a7a8a]">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-white" />
          <h2 className="text-sm font-bold text-white">All Documents</h2>
          <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
            {allDocs.length} file{allDocs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search + Filter */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files or stages..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a8a]"
          />
        </div>

        {/* Stage filter */}
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a8a] bg-white"
        >
          <option value="all">All Stages</option>
          {stagesWithFiles.map((id) => (
            <option key={id} value={id}>{nodeLabels[id] ?? id}</option>
          ))}
        </select>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <FolderOpen className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-400">
              {allDocs.length === 0 ? 'No documents uploaded yet' : 'No files match your search'}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {allDocs.length === 0
                ? 'Click on a flowchart node to upload files'
                : 'Try a different search or filter'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                {/* File type icon */}
                <span className="text-2xl flex-shrink-0 mt-0.5">{fileIcon(doc.type)}</span>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                  
                  {/* Description - shown above metadata */}
                  {doc.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[#1a7a8a] bg-[#e0f7fa] px-1.5 py-0.5 rounded">
                      {doc.stageLabel}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatFileSize(doc.size)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {doc.uploadedBy}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatTimestamp(doc.uploadedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadFile(doc)}
                    className="p-1.5 text-gray-400 hover:text-[#1a7a8a] hover:bg-[#e0f7fa] rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteFile(doc.stageId, doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer summary */}
      {allDocs.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          <p className="text-xs text-gray-500">
            {filtered.length} of {allDocs.length} file{allDocs.length !== 1 ? 's' : ''} shown
            {' · '}
            {stagesWithFiles.length} stage{stagesWithFiles.length !== 1 ? 's' : ''} with documents
          </p>
        </div>
      )}
    </div>
  );
}
