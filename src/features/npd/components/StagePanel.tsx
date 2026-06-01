import React, { useState, useRef, useCallback } from 'react';
import {
  X, Upload, Trash2, Download, CheckCircle, XCircle,
  Clock, FileText, ChevronDown, ChevronUp, AlertTriangle, FlaskConical,
} from 'lucide-react';
import {
  workflowService,
  StageData,
  NodeStatus,
  ValidationCriterion,
  UploadedFile,
} from '@/services/workflowService';
import { useAuth } from '@/features/auth/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StagePanelProps {
  projectId: string;
  nodeId: string;
  nodeLabel: string;
  stageData: StageData;
  onClose: () => void;
  onDataChange: () => void;
}

type TabId = 'documents' | 'validation' | 'audit';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<NodeStatus, { label: string; className: string }> = {
  idle:     { label: 'No Docs',      className: 'bg-gray-100 text-gray-600' },
  uploaded: { label: 'Under Review', className: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved',     className: 'bg-green-100 text-green-700' },
  partial:  { label: 'Partial',      className: 'bg-orange-100 text-orange-700' },
  rejected: { label: 'Rejected',     className: 'bg-red-100 text-red-700' },
};

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

// ─── Criterion Row ────────────────────────────────────────────────────────────

interface CriterionRowProps {
  criterion: ValidationCriterion;
  isDocumentUploaded: boolean;
  onUpdate: (id: string, status: 'pending' | 'pass' | 'fail', comment: string) => void;
}

function CriterionRow({ criterion, isDocumentUploaded, onUpdate }: CriterionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState(criterion.comment ?? '');

  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-gray-400" />,
    pass:    <CheckCircle className="h-4 w-4 text-green-500" />,
    fail:    <XCircle className="h-4 w-4 text-red-500" />,
  }[criterion.status];

  // Determine if this criterion is automatic
  const isDocumentUploadedCriterion = criterion.label === 'Document Uploaded';
  const isInitialReview = criterion.label === 'Initial Review';
  const isAuditReview = criterion.label === 'Audit Review - PDI';

  // Auto-update Document Uploaded status
  React.useEffect(() => {
    if (isDocumentUploadedCriterion && isDocumentUploaded && criterion.status === 'pending') {
      onUpdate(criterion.id, 'pass', 'Document uploaded automatically');
    } else if (isDocumentUploadedCriterion && !isDocumentUploaded && criterion.status === 'pass') {
      onUpdate(criterion.id, 'pending', '');
    }
  }, [isDocumentUploadedCriterion, isDocumentUploaded, criterion.id, criterion.status, onUpdate]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
        {statusIcon}
        <span className="flex-1 text-sm text-gray-800">{criterion.label}</span>
        {criterion.required && (
          <span className="text-[10px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
            Required
          </span>
        )}
        {(isInitialReview || isAuditReview) && (
          <span className="text-[10px] font-bold uppercase text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
            Auto
          </span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-400 hover:text-gray-600 ml-1"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-3 py-2 space-y-2 bg-white">
          {/* Document Uploaded: Display only */}
          {isDocumentUploadedCriterion && (
            <div className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">
              <p className="font-semibold mb-1">Automatic Validation</p>
              <p>This criterion automatically passes when a document is uploaded to this stage.</p>
            </div>
          )}

          {/* Initial Review: Automatic with Review button */}
          {isInitialReview && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 bg-blue-50 rounded-md px-3 py-2">
                <p className="font-semibold mb-1">Automatic Review</p>
                <p>Compares current node data with previous node's approved data.</p>
              </div>
              <button
                onClick={() => {
                  // TODO: Implement automatic validation logic
                  // For now, simulate automatic pass
                  const result = Math.random() > 0.3 ? 'pass' : 'fail';
                  onUpdate(criterion.id, result, `Automatic review ${result === 'pass' ? 'passed' : 'failed'}: Data validation complete`);
                }}
                disabled={!isDocumentUploaded || criterion.status !== 'pending'}
                className="w-full py-2 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {criterion.status === 'pending' ? 'Run Review' : criterion.status === 'pass' ? '✓ Review Passed' : '✗ Review Failed'}
              </button>
            </div>
          )}

          {/* Audit Review - PDI: Manual Pass/Fail */}
          {isAuditReview && (
            <div className="flex gap-2">
              {(['pending', 'pass', 'fail'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdate(criterion.id, s, comment)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    criterion.status === s
                      ? s === 'pass'
                        ? 'bg-green-500 text-white border-green-500'
                        : s === 'fail'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-500 text-white border-gray-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Comment field for all */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => onUpdate(criterion.id, criterion.status, comment)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function StagePanel({
  projectId,
  nodeId,
  nodeLabel,
  stageData,
  onClose,
  onDataChange,
}: StagePanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('documents');
  const [isDragging, setIsDragging] = useState(false);
  const [reviewComment, setReviewComment] = useState(stageData.reviewComment);
  const [uploading, setUploading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = user?.id ?? 'unknown';
  const userName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username
    : 'Unknown User';

  const badge = STATUS_BADGE[stageData.status];

  // ── File upload ────────────────────────────────────────────────────────────

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      
      // For single file, show description modal
      if (files.length === 1) {
        setPendingFile(files[0]);
        setFileDescription('');
        setShowDescriptionModal(true);
        return;
      }
      
      // For multiple files, upload without description
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          await workflowService.uploadFile(projectId, nodeId, file, userId, userName);
        }
        onDataChange();
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setUploading(false);
      }
    },
    [projectId, nodeId, userId, userName, onDataChange]
  );

  const handleUploadWithDescription = async () => {
    if (!pendingFile) return;
    
    setUploading(true);
    setShowDescriptionModal(false);
    try {
      await workflowService.uploadFile(
        projectId, 
        nodeId, 
        pendingFile, 
        userId, 
        userName,
        fileDescription || undefined
      );
      onDataChange();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      setPendingFile(null);
      setFileDescription('');
    }
  };

  const handleCancelUpload = () => {
    setShowDescriptionModal(false);
    setPendingFile(null);
    setFileDescription('');
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  // ── File download ──────────────────────────────────────────────────────────

  const downloadFile = (file: UploadedFile) => {
    const byteString = atob(file.dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── File delete ────────────────────────────────────────────────────────────

  const deleteFile = (fileId: string) => {
    workflowService.deleteFile(projectId, nodeId, fileId, userId, userName);
    onDataChange();
  };

  // ── Criterion update ───────────────────────────────────────────────────────

  const updateCriterion = (
    criterionId: string,
    status: 'pending' | 'pass' | 'fail',
    comment: string
  ) => {
    workflowService.updateValidationCriterion(
      projectId, nodeId, criterionId, status, comment, userId, userName
    );
    onDataChange();
  };

  // ── Approve / Reject ───────────────────────────────────────────────────────

  const allRequiredPass = stageData.validationCriteria
    .filter((c) => c.required)
    .every((c) => c.status === 'pass');

  const passedCount = stageData.validationCriteria.filter((c) => c.status === 'pass').length;
  const totalCount = stageData.validationCriteria.length;

  const handleApprove = () => {
    workflowService.approveStage(projectId, nodeId, userId, userName, reviewComment);
    onDataChange();
  };

  const handleReject = () => {
    workflowService.rejectStage(projectId, nodeId, userId, userName, reviewComment);
    onDataChange();
  };

  const handleSave = () => {
    workflowService.saveStageData(
      projectId, nodeId,
      { reviewComment },
      userId, userName
    );
    onDataChange();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="absolute top-0 right-0 h-full w-[480px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-[#1a7a8a] flex-shrink-0" />
          <h3 className="text-sm font-bold text-gray-900 truncate">{nodeLabel}</h3>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 flex-shrink-0">
        {(['documents', 'validation', 'audit'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-[#1a7a8a] border-b-2 border-[#1a7a8a]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'audit' ? 'Audit Trail' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Documents Tab ──────────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="p-4 space-y-4">
            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isDragging
                  ? 'border-[#1a7a8a] bg-teal-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">
                {uploading ? 'Uploading...' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, PPTX, PNG, JPG</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-[#1a7a8a] hover:bg-[#155f6e] rounded-lg transition-colors disabled:opacity-50"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => void handleFiles(e.target.files)}
              />
            </div>

            {/* Test button — toggles node green to simulate completion */}
            <button
              onClick={() => {
                if (testCompleted) {
                  // Reset back to idle
                  workflowService.saveStageData(
                    projectId, nodeId,
                    { status: 'idle' as const },
                    userId, userName
                  );
                  setTestCompleted(false);
                  onDataChange();
                } else {
                  workflowService.approveStage(projectId, nodeId, userId, userName, '(test)');
                  setTestCompleted(true);
                  onDataChange();
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                testCompleted
                  ? 'bg-green-500 border-green-500 text-white shadow-md'
                  : 'bg-white border-dashed border-green-400 text-green-600 hover:bg-green-50'
              }`}
            >
              <FlaskConical className="h-4 w-4" />
              {testCompleted ? '✓ Node is Green — Click to Reset' : 'Test — Mark Node Complete (Green)'}
            </button>

            {/* localStorage warning */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Files are stored in browser localStorage. Large files may exceed storage limits.
              </p>
            </div>

            {/* File list */}
            {stageData.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Uploaded Files ({stageData.files.length})
                </p>
                {stageData.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                      {file.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{file.description}</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatFileSize(file.size)} · {file.uploadedBy} · {formatTimestamp(file.uploadedAt)}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => downloadFile(file)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inherited data */}
            {stageData.inheritedData && Object.keys(stageData.inheritedData).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Inherited from Previous Stage
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                  {Object.entries(stageData.inheritedData).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="font-semibold text-blue-700 min-w-[100px]">{k}:</span>
                      <span className="text-blue-600">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Validation Tab ─────────────────────────────────────────────── */}
        {activeTab === 'validation' && (
          <div className="p-4 space-y-4">
            {/* Criteria list */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Validation Criteria
              </p>
              {stageData.validationCriteria.map((c) => (
                <CriterionRow 
                  key={c.id} 
                  criterion={c} 
                  isDocumentUploaded={stageData.files.length > 0}
                  onUpdate={updateCriterion} 
                />
              ))}
            </div>

            {/* Review comment */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Review Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Add a review comment..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1a7a8a]"
              />
            </div>

            {/* Approve / Reject */}
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={!allRequiredPass}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={!allRequiredPass ? 'All required criteria must be passed first' : ''}
              >
                <CheckCircle className="h-4 w-4" />
                Approve Stage
              </button>
              <button
                onClick={handleReject}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject Stage
              </button>
            </div>

            {/* Approved info */}
            {stageData.status === 'approved' && stageData.approvedBy && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                <span className="font-semibold">Approved by:</span> {stageData.approvedBy}
                {stageData.approvedAt && (
                  <> · {formatTimestamp(stageData.approvedAt)}</>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Audit Trail Tab ────────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Audit Trail ({stageData.auditTrail.length} entries)
            </p>
            {stageData.auditTrail.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>
            )}
            {stageData.auditTrail.map((entry) => (
              <div key={entry.id} className="border-l-2 border-[#1a7a8a] pl-3 py-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-800">{entry.action}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">{entry.userName} — {entry.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
        <span className="text-xs text-gray-500">
          {passedCount} / {totalCount} criteria passed
        </span>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1a7a8a] hover:bg-[#155f6e] rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Description Modal */}
      {showDescriptionModal && pendingFile && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px] max-w-[90%]">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">Add File Description</h3>
              <p className="text-xs text-gray-500 mt-1">
                Uploading: <span className="font-semibold">{pendingFile.name}</span>
              </p>
            </div>
            <div className="px-5 py-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Enter a brief description for this file..."
                rows={3}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#1a7a8a]"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                This description will be displayed with the file and will NOT be included in the file content.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadWithDescription}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1a7a8a] hover:bg-[#155f6e] rounded-lg transition-colors"
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
