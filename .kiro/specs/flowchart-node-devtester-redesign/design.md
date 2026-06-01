# Design Document

## Overview

This design covers two major UI/UX improvements to the NPD web application:

1. **Developer Tester Simplification** — Streamline the developer testing console by replacing multiple category-specific test buttons with a single "TEST ALL" button, and reorganize results into a binary WORKING/NOT WORKING layout with summary statistics for rapid health assessment.

2. **Flowchart Node Redesign** — Transform workflow nodes (except Marketing Input / RFQ) into a split two-section layout: a clickable TopSection for file uploads and a BottomSection containing a Review Status Button that enforces a file-gated state machine (Review → Reviewing… → Reviewed) with parameter validation against upstream nodes.

3. **Parameter Validation System** — During the review process, validate current node parameters against upstream (previous) nodes. Upon successful validation, the TopSection background turns green and the BottomSection displays "File Reviewed" status.

The design preserves all existing ReactFlow topology, edge connections, and localStorage-based persistence while introducing clearer visual hierarchy, interaction patterns, and workflow validation logic.

---

## Architecture

### High-Level Component Structure

```
DevConsole (src/devtools/DevConsole.tsx)
├── FloatingTriggerButton
├── ConsolePanel
│   ├── Header (with status indicators)
│   ├── ActionBar (TEST ALL button + Clear)
│   ├── StatsBar (Total, Passed, Failed, Success %)
│   ├── TabBar (Results | Logs)
│   ├── ContentArea
│   │   ├── ResultsTab
│   │   │   ├── WorkingSection (pass, warning, skipped)
│   │   │   └── NotWorkingSection (fail, unknown)
│   │   └── LogsTab
│   └── Footer (Export JSON/TXT + Timing)
└── TestEngine (src/devtools/testEngine.ts)
    └── Suite Registry (navigation, buttons, forms, flowchart, files, api, database)

NPDWorkflow (src/features/npd/components/NPDWorkflow.tsx)
├── WorkflowCanvas
│   ├── ReactFlow
│   │   ├── WorkflowProcessNode (redesigned as SplitNode)
│   │   │   ├── TopSection (clickable → UploadModal, green on validation pass)
│   │   │   └── BottomSection (ReviewButton state machine + validation)
│   │   ├── Marketing_Input_Node (single-section, special case)
│   │   ├── WorkflowDecisionNode (unchanged diamond)
│   │   └── WorkflowOvalNode (unchanged pill)
│   ├── StagePanel (existing)
│   └── DocumentsPanel (existing)
├── WorkflowService (src/services/workflowService.ts)
│   ├── ReviewState persistence (idle | reviewing | reviewed)
│   └── ValidationResult persistence (pass | fail | pending)
└── ValidationEngine (src/services/validationEngine.ts) [NEW]
    └── Parameter validation logic against upstream nodes
```

### Data Flow

**Developer Tester:**
1. User clicks "TEST ALL" → DevConsole calls `runSuites()` from TestEngine
2. TestEngine executes all registered suites sequentially, invoking `onProgress` callback per result
3. DevConsole accumulates results, updates stats in real-time
4. On completion, DevConsole groups results into WORKING/NOT WORKING sections
5. User can export results as JSON or TXT

**Flowchart Node Interaction:**
1. User clicks TopSection → WorkflowNode opens UploadModal
2. User uploads file → WorkflowService persists to localStorage, updates `nodeStatus` to `uploaded`
3. ReviewButton becomes enabled (opacity 100%, pointer-events auto)
4. User clicks ReviewButton → Button enters `reviewing` state (3s delay)
5. **During reviewing state** → ValidationEngine retrieves upstream node data and validates parameters
6. After 3s → Button transitions to `reviewed` state, WorkflowService persists `reviewState` and `validationResult`
7. **If validation passed** → TopSection background changes to green (#16a34a), BottomSection shows "File Reviewed"
8. **If validation failed** → TopSection keeps original color, BottomSection shows "File Reviewed"
9. On page reload → WorkflowService hydrates `reviewState` and `validationResult` from localStorage, applies green color if validation passed

---

## Components and Interfaces

### DevConsole Component

**Location:** `src/devtools/DevConsole.tsx`

**Props:** None (self-contained, only renders in `import.meta.env.DEV`)

**State:**
```typescript
interface DevConsoleState {
  open: boolean;
  running: boolean;
  results: TestResult[];
  logs: LogLine[];
  activeTab: 'results' | 'logs';
  filter: TestStatus | 'all';
  startTime: number | null;
  elapsed: number;
}
```

**Key Methods:**
- `runTests(category?: TestCategory)` — Executes test suites, updates state via `onProgress`
- `addLog(result: TestResult)` — Appends formatted log entry
- `exportJSON()` — Downloads results + logs as JSON
- `exportTXT()` — Downloads results + logs as plain text

**UI Sections:**
1. **ActionBar:** Single "TEST ALL" button (primary), "Clear" button (secondary)
2. **StatsBar:** Four metrics (Total, Passed, Failed, Success %) + color-coded percentage
3. **ResultsTab:** Two collapsible sections:
   - **WORKING:** `status === 'pass' || 'warning' || 'skipped'`
   - **NOT WORKING:** `status === 'fail' || unknown`
4. **LogsTab:** Timestamped log entries with status-colored prefixes

### TestEngine Module

**Location:** `src/devtools/testEngine.ts`

**Exports:**
```typescript
export type TestStatus = 'pass' | 'fail' | 'warning' | 'skipped';
export type TestCategory = 'navigation' | 'buttons' | 'forms' | 'flowchart' | 'files' | 'api' | 'database';

export interface TestResult {
  id: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  message: string;
  detail?: string;
  duration: number;
  timestamp: string;
}

export interface TestSuite {
  id: string;
  name: string;
  category: TestCategory;
  run: () => Promise<TestResult[]>;
}

export function registerSuite(suite: TestSuite): void;
export function getSuites(category?: TestCategory): TestSuite[];
export async function runSuites(
  category?: TestCategory,
  onProgress?: (result: TestResult) => void
): Promise<TestResult[]>;
```

**Registered Suites:**
- `navigation` — Route registration, AuthGuard checks
- `buttons` — Button discovery, accessibility labels
- `forms` — Input/select/textarea discovery, validation
- `flowchart` — ReactFlow canvas, nodes, edges, controls
- `files` — localStorage availability, quota, workflow keys
- `api` — projectService, authService method calls
- `database` — localStorage CRUD operations

### WorkflowProcessNode Component (Redesigned)

**Location:** `src/features/npd/components/WorkflowNode.tsx`

**Props:**
```typescript
interface WorkflowNodeData {
  label: string;
  nodeStatus: NodeStatus;
  reviewState: ReviewState;
  validationResult: ValidationResult; // NEW
  fileCount: number;
  passedCriteria: number;
  totalCriteria: number;
  lastModified?: string;
  variant?: 'start' | 'end';
  accentColor?: string;
  onUploadClick?: (nodeId: string) => void;
  onReviewStart?: (nodeId: string) => void;
  onReviewed?: (nodeId: string, validationResult: ValidationResult) => void; // UPDATED
}
```

**Structure:**
```tsx
<div className="workflow-process-node">
  <Handle type="target" position={Position.Top} />
  <Handle type="target" position={Position.Left} id="left-target" />
  <Handle type="target" position={Position.Right} id="right-target" />
  <Handle type="target" position={Position.Bottom} id="bottom-target" />

  {/* TopSection — clickable for upload, green if validation passed */}
  <div 
    className="top-section" 
    onClick={() => onUploadClick?.(nodeId)}
    style={{
      backgroundColor: data.validationResult === 'pass' 
        ? '#16a34a' 
        : data.accentColor
    }}
  >
    <span className="stage-name">{data.label}</span>
    {fileCount > 0 && <span className="file-badge">{fileCount} files</span>}
  </div>

  {/* Horizontal divider */}
  <div className="divider" />

  {/* BottomSection — ReviewButton */}
  <div className="bottom-section">
    <ReviewButton
      reviewState={data.reviewState}
      validationResult={data.validationResult}
      fileCount={data.fileCount}
      nodeId={nodeId}
      projectId={projectId}
      onReviewStart={() => onReviewStart?.(nodeId)}
      onReviewed={(validationResult) => onReviewed?.(nodeId, validationResult)}
    />
  </div>

  <Handle type="source" position={Position.Bottom} />
  <Handle type="source" position={Position.Right} id="right-source" />
  <Handle type="source" position={Position.Left} id="left-source" />
  <Handle type="source" position={Position.Top} id="top-source" />
</div>
```

### ReviewButton Component

**Location:** `src/features/npd/components/ReviewButton.tsx` (new file)

**Props:**
```typescript
interface ReviewButtonProps {
  reviewState: ReviewState;
  validationResult: ValidationResult;
  fileCount: number;
  nodeId: string;
  projectId: string;
  onReviewStart?: () => void;
  onReviewed?: (validationResult: ValidationResult) => void;
}
```

**State Machine:**
```
idle (fileCount === 0)
  ↓ [file uploaded]
idle (fileCount > 0, enabled)
  ↓ [user clicks]
reviewing (3s delay, spinner + validation)
  ↓ [3s elapsed + validation complete]
reviewed (locked, disabled, shows "File Reviewed")
```

**Rendering Logic:**
```typescript
if (fileCount === 0) {
  return <button disabled opacity={0.5}>Review</button>;
}
if (reviewState === 'idle') {
  return <button onClick={handleClick}>Review</button>;
}
if (reviewState === 'reviewing') {
  return <button disabled><Spinner />Reviewing…</button>;
}
if (reviewState === 'reviewed') {
  return <button disabled>File Reviewed</button>;
}
```

**Validation Integration:**

```typescript
const handleClick = async () => {
  onReviewStart?.();
  
  // Start 3-second delay
  const validationPromise = validateNode(projectId, nodeId, workflowState, edges);
  
  await Promise.all([
    new Promise(resolve => setTimeout(resolve, 3000)),
    validationPromise
  ]);
  
  const report = await validationPromise;
  const result = report.result;
  
  onReviewed?.(result);
};
```

### Marketing_Input_Node Component

**Location:** `src/features/npd/components/WorkflowNode.tsx`

**Special Behavior:**
- Single-section layout (no TopSection/BottomSection split)
- Entire node body is clickable → opens UploadModal
- After upload, displays "File Uploaded" status indicator in lower area
- No ReviewButton

**Structure:**
```tsx
<div className="marketing-input-node" onClick={() => onUploadClick?.('marketing-input')}>
  <Handle type="target" position={Position.Top} />
  <div className="node-body">
    <span className="stage-name">Marketing Input / RFQ</span>
    {fileCount > 0 && <span className="status-indicator">File Uploaded</span>}
  </div>
  <Handle type="source" position={Position.Bottom} />
</div>
```

### WorkflowService Extensions

**Location:** `src/services/workflowService.ts`

**New Type:**
```typescript
export type ReviewState = 'idle' | 'reviewing' | 'reviewed';
```

**Updated StageData Interface:**
```typescript
export interface StageData {
  nodeId: string;
  status: NodeStatus;
  reviewState: ReviewState; // NEW
  validationResult: ValidationResult; // NEW
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
```

**New Methods:**
```typescript
setReviewState(
  projectId: string,
  nodeId: string,
  reviewState: ReviewState,
  userId: string,
  userName: string
): WorkflowState;

getReviewState(projectId: string, nodeId: string): ReviewState;

setValidationResult(
  projectId: string,
  nodeId: string,
  validationResult: ValidationResult
): WorkflowState;

getValidationResult(projectId: string, nodeId: string): ValidationResult;
```

---

### ValidationEngine Module

**Location:** `src/services/validationEngine.ts` (new file)

**Purpose:** Validates current node parameters against upstream nodes during the review process.

**Exports:**
```typescript
export type ValidationResult = 'pass' | 'fail' | 'pending';

export interface ValidationRule {
  ruleId: string;
  description: string;
  validate: (currentNode: StageData, upstreamNodes: StageData[]) => boolean;
}

export interface ValidationReport {
  result: ValidationResult;
  passedRules: string[];
  failedRules: string[];
  timestamp: string;
}

export function registerValidationRule(nodeId: string, rule: ValidationRule): void;
export function getValidationRules(nodeId: string): ValidationRule[];
export async function validateNode(
  projectId: string,
  nodeId: string,
  workflowState: WorkflowState,
  edges: Edge[]
): Promise<ValidationReport>;
```

**Key Methods:**

1. **`validateNode()`** — Main validation orchestrator
   - Retrieves current node data from `workflowState`
   - Identifies upstream nodes using ReactFlow `edges` array
   - Retrieves upstream node data from `workflowState`
   - Executes all registered validation rules for the node
   - Returns `ValidationReport` with pass/fail result

2. **`registerValidationRule()`** — Registers custom validation rules per node
   - Example: "Proto Reports must have at least 3 files if Review Against Quotation has 5+ files"
   - Example: "CRA stage must validate that all upstream stages are in 'reviewed' state"

3. **`getValidationRules()`** — Retrieves all validation rules for a specific node

**Default Validation Rules:**

```typescript
// Example: All upstream nodes must be reviewed
const upstreamReviewedRule: ValidationRule = {
  ruleId: 'upstream-reviewed',
  description: 'All upstream nodes must be in reviewed state',
  validate: (currentNode, upstreamNodes) => {
    return upstreamNodes.every(node => node.reviewState === 'reviewed');
  }
};

// Example: File count consistency
const fileCountRule: ValidationRule = {
  ruleId: 'file-count-minimum',
  description: 'Current node must have at least 1 file uploaded',
  validate: (currentNode, upstreamNodes) => {
    return currentNode.files.length >= 1;
  }
};
```

**Integration with ReviewButton:**

During the "Reviewing..." state (3-second delay), the ReviewButton component calls:

```typescript
const report = await validateNode(projectId, nodeId, workflowState, edges);
if (report.result === 'pass') {
  // Set TopSection background to green
  // Set BottomSection text to "File Reviewed"
  workflowService.setValidationResult(projectId, nodeId, 'pass');
} else {
  // Keep TopSection original color
  // Set BottomSection text to "File Reviewed"
  workflowService.setValidationResult(projectId, nodeId, 'fail');
}
```

---

## Data Models

### TestResult

```typescript
interface TestResult {
  id: string;              // Unique identifier (e.g., "nav-/npd")
  name: string;            // Human-readable test name
  category: TestCategory;  // Suite category
  status: TestStatus;      // pass | fail | warning | skipped
  message: string;         // Short result message
  detail?: string;         // Optional detailed explanation
  duration: number;        // Execution time in milliseconds
  timestamp: string;       // ISO 8601 timestamp
}
```

### LogLine

```typescript
interface LogLine {
  ts: string;              // HH:MM:SS timestamp
  status: TestStatus;      // For color coding
  text: string;            // Formatted log message
}
```

### ReviewState

```typescript
type ReviewState = 'idle' | 'reviewing' | 'reviewed';
```

**State Transitions:**
- `idle` → `reviewing`: User clicks ReviewButton when `fileCount > 0`
- `reviewing` → `reviewed`: 3 seconds elapse AND validation completes
- `reviewed` → `idle`: All files removed from stage

**Persistence:**
- Stored in `StageData.reviewState` field
- Persisted to localStorage via `workflowService._save()`
- Hydrated on component mount via `workflowService.getWorkflowState()`

---

### ValidationResult

```typescript
type ValidationResult = 'pass' | 'fail' | 'pending';
```

**Values:**
- `pending`: Initial state, no validation has been performed
- `pass`: Validation completed successfully, all rules passed
- `fail`: Validation completed, one or more rules failed

**Visual Feedback:**
- `pass`: TopSection background = green (#16a34a), BottomSection shows "File Reviewed"
- `fail`: TopSection background = original NODE_ACCENT color, BottomSection shows "File Reviewed"
- `pending`: TopSection background = original NODE_ACCENT color

**Persistence:**
- Stored in `StageData.validationResult` field
- Persisted to localStorage via `workflowService._save()`
- Hydrated on component mount via `workflowService.getWorkflowState()`

---

### ValidationReport

```typescript
interface ValidationReport {
  result: ValidationResult;
  passedRules: string[];
  failedRules: string[];
  timestamp: string;
}
```

**Purpose:** Detailed report of validation execution, including which rules passed/failed.

**Usage:** Returned by `validateNode()` function, can be logged or displayed to user for debugging.

### WorkflowNodeData (Updated)

```typescript
interface WorkflowNodeData {
  label: string;
  nodeStatus: NodeStatus;
  reviewState: ReviewState;
  validationResult: ValidationResult;   // NEW
  fileCount: number;
  passedCriteria: number;
  totalCriteria: number;
  lastModified?: string;
  variant?: 'start' | 'end';
  accentColor?: string;
  onUploadClick?: (nodeId: string) => void;
  onReviewStart?: (nodeId: string) => void;
  onReviewed?: (nodeId: string, validationResult: ValidationResult) => void;  // UPDATED
}
```

---

## Error Handling

### DevConsole Error Handling

1. **Suite Execution Failure:**
   - If a test suite throws an unhandled error, catch it in `runSuites()`
   - Record all tests from that suite as `fail` status
   - Continue executing remaining suites
   - Display error message in logs: `[FAIL] Suite "${suiteName}" threw exception: ${error.message}`

2. **Export Failure:**
   - If `exportJSON()` or `exportTXT()` fails (e.g., Blob API unavailable), catch error
   - Display inline error message: "Export failed. Check console for details."
   - Log full error to browser console

3. **Progress Callback Failure:**
   - If `onProgress` callback throws, catch error silently
   - Continue test execution without interruption
   - Log warning to console: `onProgress callback failed: ${error.message}`

### WorkflowNode Error Handling

1. **UploadModal Open Failure:**
   - If `onUploadClick` callback throws, catch error
   - Display inline error message within node body: "Failed to open upload modal"
   - Log error to console with node ID

2. **ReviewButton Callback Failure:**
   - If `onReviewStart` or `onReviewed` throws, catch error
   - Log error to console: `ReviewButton callback failed for node ${nodeId}: ${error.message}`
   - Continue internal state transition (idle → reviewing → reviewed) without interruption

3. **File Upload Failure:**
   - If file exceeds 10 MB, reject with error: "File exceeds 10 MB limit"
   - If 20-file limit reached, reject with error: "Maximum 20 files per stage"
   - If file type not in accepted list, reject with error: "Accepted types: PDF, DOCX, XLSX, PPTX, PNG, JPG, JPEG"
   - Display error in UploadModal, do not close modal

4. **localStorage Quota Exceeded:**
   - If `workflowService._save()` throws QuotaExceededError, catch error
   - Display toast notification: "Storage quota exceeded. Remove files to continue."
   - Revert state change (do not persist)

5. **ReviewState Hydration Failure:**
   - If `reviewState` field missing from saved data, default to `'idle'`
   - If `reviewState` has invalid value, default to `'idle'` and log warning

---

## Testing Strategy

This feature involves UI interactions, state management, and localStorage persistence. Testing will use a combination of unit tests and integration tests.

### Unit Tests

**DevConsole Component:**
- Test "TEST ALL" button click triggers `runSuites()` with no category argument
- Test results grouping: `pass/warning/skipped` → WORKING, `fail/unknown` → NOT WORKING
- Test stats calculation: `floor((passed / total) × 100)`, division-by-zero handling
- Test color coding: Success % ≥ 80 → green, < 80 → red
- Test export functions: `exportJSON()` and `exportTXT()` produce valid output

**TestEngine Module:**
- Test `registerSuite()` adds suite to registry
- Test `getSuites()` filters by category
- Test `runSuites()` executes all suites sequentially
- Test `onProgress` callback invoked per result
- Test suite error handling: thrown errors recorded as `fail` status

**ReviewButton Component:**
- Test disabled state when `fileCount === 0`
- Test enabled state when `fileCount > 0` and `reviewState === 'idle'`
- Test state transition: idle → reviewing → reviewed
- Test 3-second delay between reviewing and reviewed
- Test callback invocation: `onReviewStart` on click, `onReviewed` after 3s
- Test error handling: callbacks throwing errors do not interrupt state machine

**WorkflowService Extensions:**
- Test `setReviewState()` persists to localStorage
- Test `getReviewState()` retrieves from localStorage
- Test `reviewState` defaults to `'idle'` if missing
- Test `reviewState` resets to `'idle'` when all files removed

### Integration Tests

**DevConsole + TestEngine:**
- Test full test run: click "TEST ALL" → all suites execute → results displayed
- Test real-time stats update during test execution
- Test log accumulation during test execution
- Test export after test completion

**WorkflowNode + WorkflowService:**
- Test TopSection click opens UploadModal
- Test file upload enables ReviewButton
- Test ReviewButton click → reviewing → reviewed state progression
- Test ReviewButton state persists across page reload
- Test file removal resets ReviewButton to idle (if reviewed)

**Marketing_Input_Node:**
- Test single-click opens UploadModal
- Test "File Uploaded" indicator appears after upload
- Test no ReviewButton rendered

### Manual Testing Checklist

- [ ] DevConsole "TEST ALL" button runs all suites
- [ ] Results grouped into WORKING / NOT WORKING sections
- [ ] Stats bar displays correct counts and percentage
- [ ] Success % color-coded (green ≥ 80%, red < 80%)
- [ ] Export JSON/TXT produces valid files
- [ ] WorkflowProcessNode split into TopSection + BottomSection
- [ ] TopSection click opens UploadModal
- [ ] File upload enables ReviewButton
- [ ] ReviewButton progresses: Review → Reviewing… → Reviewed
- [ ] ReviewButton state persists after page reload
- [ ] Marketing_Input_Node single-section layout
- [ ] Marketing_Input_Node shows "File Uploaded" after upload
- [ ] All ReactFlow edges and positions preserved
- [ ] Node hover animations smooth (0.18s ease)
- [ ] ReviewButton spinner rotates during "Reviewing…" state

---

## Visual Design Standards

### DevConsole Styling

**Color Palette:**
- Background: `#0f172a` (dark slate)
- Header: `#1e293b` (lighter slate)
- Borders: `#334155` (slate-400)
- Text: `#f1f5f9` (slate-100)
- Accent: `#a78bfa` (purple-300)
- Success: `#4ade80` (green-400)
- Failure: `#f87171` (red-400)
- Warning: `#fbbf24` (amber-400)

**Typography:**
- Font family: `'JetBrains Mono', 'Fira Code', monospace`
- Header: 13px, font-weight 700
- Stats: 16px, font-weight 800
- Result names: 11px, font-weight 600
- Logs: 11px, monospace

**Spacing:**
- Panel width: 520px
- Section padding: 8px–16px
- Button gap: 6px
- Border radius: 6px–10px

**Animations:**
- Button hover: `opacity 0.15s ease`
- Panel transitions: `all 0.2s ease`

### WorkflowNode Styling

**SplitNode Layout:**
- Width: 200px
- TopSection height: 64px (minimum)
- BottomSection height: 64px (minimum)
- Divider: 1px solid `rgba(0,0,0,0.1)`
- Border radius: 10px
- Border: 2.5px solid (status-dependent color)

**TopSection:**
- Background: `NODE_ACCENT[nodeId]` (from NPDWorkflow.tsx) OR `#16a34a` (green) if `validationResult === 'pass'`
- Text: 13px, font-weight 800, color `#ffffff`
- Padding: 9px 14px
- Cursor: pointer
- Hover: `translateY(-3px) scale(1.02)`, transition `0.18s ease`
- Transition: `background-color 0.3s ease` (for smooth color change on validation)

**BottomSection:**
- Background: Tinted based on `nodeStatus` (e.g., `#e0f7fa` for teal)
- Padding: 8px 14px
- Contains ReviewButton

**ReviewButton:**
- Border radius: 6px
- Padding: 6px 12px
- Font size: 11px, font-weight 700
- Disabled (fileCount === 0): opacity 50%, pointer-events none
- Enabled: opacity 100%, pointer-events auto
- Reviewing: background with spinner, disabled
- Reviewed: locked, disabled, text = "File Reviewed"
- Transition: `background-color 0.15s ease`

**Spinner Animation:**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner {
  animation: spin 1s linear infinite;
}
```

**Marketing_Input_Node:**
- Width: 200px
- Height: 80px (minimum)
- Single-section layout
- Background: `#e0f7fa` (teal tint)
- Border: 2.5px solid `#1a7a8a`
- Border radius: 10px
- Padding: 12px 14px
- Cursor: pointer
- Hover: same as SplitNode TopSection

**Color Coding by NodeStatus:**
- `idle`: Teal (`#1a7a8a`)
- `uploaded`: Teal (`#1a7a8a`)
- `partial`: Teal (`#1a7a8a`)
- `approved`: Green (`#16a34a`)
- `rejected`: Red (`#dc2626`)

---

## Future Extensibility

### ReviewButton Business Logic Hooks

The ReviewButton architecture supports future integration with downstream workflow actions via callback props:

```typescript
interface ReviewButtonProps {
  reviewState: ReviewState;
  fileCount: number;
  onReviewStart?: (nodeId: string) => void;  // Invoked on idle → reviewing
  onReviewed?: (nodeId: string) => void;     // Invoked on reviewing → reviewed
}
```

**Potential Use Cases:**
1. **Automated Notifications:** Trigger email/Slack notification when stage reviewed
2. **Workflow Progression:** Automatically unlock downstream nodes when stage reviewed
3. **Audit Logging:** Record review events in external audit system
4. **Analytics:** Track review completion times for process optimization
5. **Approval Workflows:** Integrate with multi-level approval systems

**Implementation Notes:**
- Callbacks are optional; ReviewButton functions without them
- Callbacks should be async-safe (errors caught and logged)
- Callbacks receive `nodeId` for context
- Internal state machine continues regardless of callback success/failure

### DevConsole Extensibility

**Adding New Test Suites:**
```typescript
// In testEngine.ts
registerSuite({
  id: 'new-suite',
  name: 'New Feature Tests',
  category: 'api', // or new category
  run: async () => {
    const results: TestResult[] = [];
    // ... test logic
    return results;
  },
});
```

**Custom Result Filters:**
Future enhancement could add custom filter pills (e.g., by category, by duration threshold).

**Persistent Test History:**
Future enhancement could store test results in localStorage for historical comparison.

---

## Migration Notes

### Existing Code Changes

**DevConsole.tsx:**
- Remove individual category buttons (Navigation, Buttons, Forms, etc.)
- Replace with single "TEST ALL" button
- Refactor results display: remove Warnings/Skipped sections, merge into WORKING
- Add stats bar with real-time updates
- Update color coding logic for Success %

**WorkflowNode.tsx:**
- Split `WorkflowProcessNode` into TopSection + BottomSection
- Add `reviewState` to `WorkflowNodeData` interface
- Add `onUploadClick`, `onReviewStart`, `onReviewed` callback props
- Create new `ReviewButton` component
- Create new `Marketing_Input_Node` component (or conditional rendering)

**workflowService.ts:**
- Add `reviewState: ReviewState` field to `StageData` interface
- Add `setReviewState()` and `getReviewState()` methods
- Update `buildDefaultStage()` to initialize `reviewState: 'idle'`
- Update `getWorkflowState()` to hydrate `reviewState` for older saved data

**NPDWorkflow.tsx:**
- Update `buildNodes()` to pass `reviewState` to node data
- Add `onUploadClick` handler to open UploadModal
- Add `onReviewStart` and `onReviewed` handlers to call `workflowService.setReviewState()`

### Backward Compatibility

**localStorage Data:**
- Existing `WorkflowState` objects missing `reviewState` field will default to `'idle'`
- No data migration required; field added on-the-fly during hydration

**ReactFlow Topology:**
- All node positions, edge connections, and handle IDs preserved
- No changes to `POSITIONS`, `buildEdges()`, or `TYPE_MAP`

**Existing Components:**
- `WorkflowDecisionNode` and `WorkflowOvalNode` unchanged
- `StagePanel` and `DocumentsPanel` unchanged
- `WorkflowMetrics` unchanged

---

## Implementation Checklist

### Phase 1: DevConsole Simplification
- [ ] Remove individual category buttons from ActionBar
- [ ] Add single "TEST ALL" button
- [ ] Refactor `runTests()` to call `runSuites()` without category
- [ ] Update results grouping: WORKING (pass/warning/skipped) + NOT WORKING (fail/unknown)
- [ ] Add StatsBar component with Total, Passed, Failed, Success %
- [ ] Implement real-time stats updates via `onProgress`
- [ ] Add color coding: green ≥ 80%, red < 80%
- [ ] Test export JSON/TXT functions
- [ ] Update UI styling to match design specs

### Phase 2: WorkflowNode Redesign
- [ ] Add `ReviewState` type to workflowService.ts
- [ ] Add `ValidationResult` type to workflowService.ts
- [ ] Update `StageData` interface with `reviewState` and `validationResult` fields
- [ ] Add `setReviewState()`, `getReviewState()`, `setValidationResult()`, `getValidationResult()` methods
- [ ] Update `buildDefaultStage()` to initialize `reviewState: 'idle'` and `validationResult: 'pending'`
- [ ] Update `getWorkflowState()` to hydrate `reviewState` and `validationResult`
- [ ] Create `ValidationEngine` module with `validateNode()` function
- [ ] Register default validation rules (upstream-reviewed, file-count-minimum)
- [ ] Create `ReviewButton` component with state machine logic and validation integration
- [ ] Split `WorkflowProcessNode` into TopSection + BottomSection
- [ ] Add `onUploadClick` handler to TopSection
- [ ] Add dynamic background color logic to TopSection (green if validation passed)
- [ ] Integrate ReviewButton into BottomSection with "File Reviewed" text
- [ ] Create `Marketing_Input_Node` component (single-section)
- [ ] Update `buildNodes()` in NPDWorkflow.tsx to pass `reviewState` and `validationResult`
- [ ] Add callback handlers for `onUploadClick`, `onReviewStart`, `onReviewed`
- [ ] Test file upload → ReviewButton enable
- [ ] Test ReviewButton state progression: idle → reviewing (with validation) → reviewed
- [ ] Test TopSection color change to green on validation pass
- [ ] Test BottomSection "File Reviewed" text display
- [ ] Test ReviewButton state persistence across page reload
- [ ] Test validation result persistence across page reload
- [ ] Test file removal → ReviewButton reset
- [ ] Update node styling to match design specs
- [ ] Test hover animations and transitions
- [ ] Verify all ReactFlow edges and positions preserved

### Phase 3: Integration Testing
- [ ] Test DevConsole "TEST ALL" end-to-end
- [ ] Test WorkflowNode upload + review workflow end-to-end
- [ ] Test Marketing_Input_Node special behavior
- [ ] Test error handling scenarios
- [ ] Test localStorage quota exceeded
- [ ] Test backward compatibility with existing saved data
- [ ] Perform manual testing checklist
- [ ] Update documentation

---

## Acceptance Criteria Mapping

This design addresses all 11 requirements from the requirements document:

- **Requirement 1:** Single "TEST ALL" button → ActionBar with single primary button
- **Requirement 2:** WORKING / NOT WORKING sections → ResultsTab grouping logic
- **Requirement 3:** Summary statistics → StatsBar with real-time updates
- **Requirement 4:** SplitNode layout → TopSection + BottomSection with divider
- **Requirement 5:** Upload via TopSection click → `onUploadClick` handler
- **Requirement 6:** Review Status Button logic → ReviewButton state machine
- **Requirement 7:** Marketing Input special behavior → Marketing_Input_Node component
- **Requirement 8:** Review Against Quotation label → "Review" (not "Under Review")
- **Requirement 9:** Visual design standards → Styling specs for all components
- **Requirement 10:** Vertical workflow preservation → No changes to topology
- **Requirement 11:** Future extensibility → Callback props for business logic

---

## Conclusion

This design provides a comprehensive blueprint for simplifying the developer testing console and redesigning workflow nodes with a clear visual hierarchy and enforced review workflow. The architecture preserves all existing functionality while introducing intuitive interaction patterns and extensibility hooks for future enhancements.

The split-node design clearly separates content (TopSection) from status (BottomSection), making the workflow more scannable and reducing cognitive load. The single "TEST ALL" button and binary WORKING/NOT WORKING results display streamline the developer testing experience, enabling rapid health assessment without navigating multiple categories.

All changes are backward-compatible with existing localStorage data and ReactFlow topology, ensuring a smooth migration path.
