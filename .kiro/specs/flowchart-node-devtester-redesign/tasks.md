# Tasks

## Phase 1: Developer Tester Simplification

### Task 1: Update TestEngine Module
**Requirements:** 1, 2, 3  
**Description:** Ensure TestEngine module exports all necessary types and functions for running all test suites sequentially with progress callbacks.

**Subtasks:**
- [x] 1.1 Verify `TestResult`, `TestSuite`, `TestCategory`, `TestStatus` types are exported
- [ ] 1.2 Verify `registerSuite()`, `getSuites()`, `runSuites()` functions are exported
- [~] 1.3 Ensure `runSuites()` accepts optional `category` parameter and `onProgress` callback
- [~] 1.4 Test that `runSuites()` with no category executes all registered suites sequentially
- [~] 1.5 Test that `onProgress` callback is invoked for each test result
- [~] 1.6 Add error handling: catch suite execution errors and record as `fail` status

**Acceptance:**
- `runSuites()` without category argument runs all test suites
- `onProgress` callback receives each `TestResult` as tests complete
- Suite errors are caught and recorded as failed tests without stopping execution

---

### Task 2: Refactor DevConsole UI - Single "TEST ALL" Button
**Requirements:** 1  
**Description:** Replace individual category buttons with a single "TEST ALL" button in the DevConsole ActionBar.

**Subtasks:**
- [~] 2.1 Remove individual category buttons (Navigation, Buttons, Forms, Flowchart, Files, API, Database) from ActionBar
- [~] 2.2 Add single "TEST ALL" button with primary styling
- [~] 2.3 Update `runTests()` method to call `runSuites()` without category parameter
- [~] 2.4 Add "RUNNING…" indicator that displays while tests execute
- [~] 2.5 Disable "TEST ALL" button while `running === true` to prevent concurrent runs
- [~] 2.6 Re-enable "TEST ALL" button when all suites complete

**Acceptance:**
- DevConsole displays exactly one "TEST ALL" button
- Clicking "TEST ALL" runs all test suites without additional input
- Button is disabled during test execution
- Button re-enables after all tests complete

---

### Task 3: Implement WORKING / NOT WORKING Results Sections
**Requirements:** 2  
**Description:** Refactor results display to show only two sections: WORKING (pass/warning/skipped) and NOT WORKING (fail/unknown).

**Subtasks:**
- [~] 3.1 Remove separate "Warnings" and "Skipped" sections from results display
- [~] 3.2 Create `WorkingSection` component that displays tests with status `pass`, `warning`, or `skipped`
- [~] 3.3 Create `NotWorkingSection` component that displays tests with status `fail` or unknown status values
- [~] 3.4 Add status label badges for `warning` and `skipped` tests in WorkingSection
- [~] 3.5 Add status label badges for unknown status values in NotWorkingSection
- [~] 3.6 Display "No passing tests found" message when WorkingSection is empty
- [~] 3.7 Display "All tests passed successfully" message when NotWorkingSection is empty

**Acceptance:**
- Results are grouped into exactly two sections: WORKING and NOT WORKING
- `pass`, `warning`, `skipped` tests appear in WORKING section
- `fail` and unknown status tests appear in NOT WORKING section
- Status labels are visible for non-pass tests
- Empty sections display appropriate messages

---

### Task 4: Add Summary Statistics Bar
**Requirements:** 3  
**Description:** Implement a statistics bar showing Total Tests, Passed Tests, Failed Tests, and Success Percentage with real-time updates.

**Subtasks:**
- [~] 4.1 Create `StatsBar` component with four metrics: Total, Passed, Failed, Success %
- [~] 4.2 Calculate Success Percentage as `floor((passed / total) × 100)`
- [~] 4.3 Handle division-by-zero: display "0%" when total tests equals zero
- [~] 4.4 Update statistics within 100ms of receiving each `TestResult` via `onProgress`
- [~] 4.5 Apply green text color when Success % ≥ 80
- [~] 4.6 Apply red text color when Success % < 80
- [~] 4.7 Hide StatsBar when no test run has been initiated or after results are cleared

**Acceptance:**
- StatsBar displays Total, Passed, Failed, and Success % after test completion
- Success % is calculated correctly and displayed as whole number
- Success % is color-coded: green (≥80%) or red (<80%)
- StatsBar updates in real-time during test execution
- StatsBar is hidden when no tests have run

---

### Task 5: Test DevConsole Error Handling
**Requirements:** 1, 2, 3  
**Description:** Verify error handling for suite execution failures, export failures, and progress callback failures.

**Subtasks:**
- [~] 5.1 Test that suite execution errors are caught and recorded as `fail` status
- [~] 5.2 Test that remaining suites continue executing after one suite fails
- [~] 5.3 Test that export functions handle Blob API unavailability gracefully
- [~] 5.4 Test that `onProgress` callback errors are caught and logged without stopping execution
- [~] 5.5 Verify error messages are displayed in logs with proper formatting

**Acceptance:**
- Suite errors don't stop test execution
- Export errors display user-friendly messages
- Progress callback errors are logged but don't interrupt tests
- All error scenarios are handled gracefully

---

## Phase 2: Core Infrastructure for Flowchart Node Redesign

### Task 6: Extend WorkflowService with ReviewState and ValidationResult
**Requirements:** 6, 11, 12  
**Description:** Add ReviewState and ValidationResult types and methods to workflowService for managing review lifecycle and validation outcomes.

**Subtasks:**
- [~] 6.1 Add `ReviewState` type: `'idle' | 'reviewing' | 'reviewed'`
- [~] 6.2 Add `ValidationResult` type: `'pass' | 'fail' | 'pending'`
- [~] 6.3 Update `StageData` interface to include `reviewState: ReviewState` field
- [~] 6.4 Update `StageData` interface to include `validationResult: ValidationResult` field
- [~] 6.5 Implement `setReviewState(projectId, nodeId, reviewState, userId, userName)` method
- [~] 6.6 Implement `getReviewState(projectId, nodeId)` method
- [~] 6.7 Implement `setValidationResult(projectId, nodeId, validationResult)` method
- [~] 6.8 Implement `getValidationResult(projectId, nodeId)` method
- [~] 6.9 Update `buildDefaultStage()` to initialize `reviewState: 'idle'` and `validationResult: 'pending'`
- [~] 6.10 Update `getWorkflowState()` to hydrate `reviewState` and `validationResult` with defaults for older data

**Acceptance:**
- `ReviewState` and `ValidationResult` types are exported
- `StageData` interface includes new fields
- All new methods persist to localStorage correctly
- Older saved data without new fields defaults to `'idle'` and `'pending'`
- Methods handle missing data gracefully

---

### Task 7: Create ValidationEngine Module
**Requirements:** 11  
**Description:** Implement ValidationEngine module for validating current node parameters against upstream nodes during review.

**Subtasks:**
- [~] 7.1 Create `src/services/validationEngine.ts` file
- [~] 7.2 Define `ValidationRule` interface with `ruleId`, `description`, and `validate` function
- [~] 7.3 Define `ValidationReport` interface with `result`, `passedRules`, `failedRules`, `timestamp`
- [~] 7.4 Implement `registerValidationRule(nodeId, rule)` function
- [~] 7.5 Implement `getValidationRules(nodeId)` function
- [~] 7.6 Implement `validateNode(projectId, nodeId, workflowState, edges)` function
- [~] 7.7 Add default validation rule: "All upstream nodes must be reviewed"
- [~] 7.8 Add default validation rule: "Current node must have at least 1 file uploaded"
- [~] 7.9 Test `validateNode()` retrieves upstream nodes correctly using ReactFlow edges
- [~] 7.10 Test `validateNode()` executes all registered rules and returns ValidationReport

**Acceptance:**
- ValidationEngine module exports all types and functions
- `validateNode()` identifies upstream nodes from edges array
- `validateNode()` executes all registered validation rules
- `ValidationReport` includes pass/fail result and rule details
- Default validation rules are registered and functional

---

### Task 8: Create ReviewButton Component
**Requirements:** 6, 11, 12  
**Description:** Implement ReviewButton component with state machine (idle → reviewing → reviewed) and validation integration.

**Subtasks:**
- [~] 8.1 Create `src/features/npd/components/ReviewButton.tsx` file
- [~] 8.2 Define `ReviewButtonProps` interface with `reviewState`, `validationResult`, `fileCount`, `nodeId`, `projectId`, `onReviewStart`, `onReviewed`
- [~] 8.3 Implement disabled state when `fileCount === 0` (opacity 50%, pointer-events none)
- [~] 8.4 Implement enabled "Review" state when `fileCount > 0` and `reviewState === 'idle'`
- [~] 8.5 Implement "Reviewing…" state with spinner and 3-second delay
- [~] 8.6 Integrate ValidationEngine: call `validateNode()` during "Reviewing…" state
- [~] 8.7 Implement "Reviewed" state (locked, disabled) with "File Reviewed" label
- [~] 8.8 Invoke `onReviewStart` callback when transitioning to "reviewing"
- [~] 8.9 Invoke `onReviewed` callback with `validationResult` when transitioning to "reviewed"
- [~] 8.10 Add error handling: catch callback errors and log without interrupting state machine
- [~] 8.11 Add spinner animation: 360° rotation per second using CSS keyframes

**Acceptance:**
- ReviewButton is disabled when no files uploaded
- ReviewButton enables when files are uploaded
- Clicking ReviewButton triggers idle → reviewing → reviewed progression
- 3-second delay occurs during "reviewing" state
- Validation runs during "reviewing" state
- Callbacks are invoked at correct state transitions
- Spinner animates smoothly during "reviewing" state
- Errors in callbacks don't break state machine

---

## Phase 3: Flowchart Node Redesign - SplitNode Layout

### Task 9: Redesign WorkflowProcessNode as SplitNode
**Requirements:** 4, 5, 9, 10  
**Description:** Transform WorkflowProcessNode into split two-section layout with TopSection (clickable for upload) and BottomSection (ReviewButton).

**Subtasks:**
- [~] 9.1 Update `WorkflowNodeData` interface to include `reviewState`, `validationResult`, `onUploadClick`, `onReviewStart`, `onReviewed`
- [~] 9.2 Refactor WorkflowProcessNode JSX to render TopSection and BottomSection with horizontal divider
- [~] 9.3 Implement TopSection: display stage name (13px, font-weight 800) and file count badge
- [~] 9.4 Make TopSection clickable: call `onUploadClick(nodeId)` on click
- [~] 9.5 Apply TopSection background color from `NODE_ACCENT` map or green (#16a34a) if `validationResult === 'pass'`
- [~] 9.6 Add smooth background-color transition (0.3s ease) for validation color change
- [~] 9.7 Implement BottomSection: render ReviewButton component
- [~] 9.8 Set fixed node width to 200px and minimum section height to 64px
- [~] 9.9 Preserve all ReactFlow Handle positions (Top, Bottom, Left, Right with named variants)
- [~] 9.10 Add hover animation: `translateY(-3px) scale(1.02)` with 0.18s ease transition
- [~] 9.11 Apply minimum padding of 8px on all sides for both sections

**Acceptance:**
- WorkflowProcessNode displays TopSection and BottomSection separated by divider
- TopSection shows stage name and file count (if files uploaded)
- TopSection is clickable and opens UploadModal
- TopSection background is green when validation passes, otherwise NODE_ACCENT color
- BottomSection contains ReviewButton
- Node dimensions are consistent (200px width, 64px min height per section)
- All ReactFlow handles are preserved
- Hover animation works smoothly
- Padding is applied correctly

---

### Task 10: Implement Marketing Input Node Special Behavior
**Requirements:** 7  
**Description:** Create or modify Marketing_Input_Node to use single-section layout with "File Uploaded" indicator.

**Subtasks:**
- [~] 10.1 Create conditional rendering logic for `marketing-input` node type
- [~] 10.2 Implement single-section layout (no TopSection/BottomSection split)
- [~] 10.3 Make entire node body clickable to open UploadModal
- [~] 10.4 Display stage name "Marketing Input / RFQ" in node body
- [~] 10.5 Display "File Uploaded" status indicator when `fileCount > 0`
- [~] 10.6 Hide "File Uploaded" indicator when `fileCount === 0`
- [~] 10.7 Preserve ReactFlow handles (Top and Bottom)
- [~] 10.8 Apply consistent styling: 200px width, 80px min height, teal background
- [~] 10.9 Add error handling: display inline error if UploadModal fails to open

**Acceptance:**
- Marketing_Input_Node uses single-section layout (not split)
- Entire node body is clickable
- "File Uploaded" indicator appears after file upload
- "File Uploaded" indicator is hidden when no files uploaded
- Node styling matches design specs
- Error handling displays inline error message

---

### Task 11: Update Review Against Quotation Node Label
**Requirements:** 8  
**Description:** Ensure Review Against Quotation node displays "Review" (not "Under Review") in ReviewButton.

**Subtasks:**
- [~] 11.1 Verify `revert-quotation` node uses ReviewButton component
- [~] 11.2 Verify ReviewButton displays "Review" label when `reviewState === 'idle'` and `fileCount > 0`
- [~] 11.3 Verify ReviewButton follows standard state progression: Review → Reviewing… → File Reviewed
- [~] 11.4 Remove any hardcoded "Under Review" text from `revert-quotation` node rendering

**Acceptance:**
- `revert-quotation` node ReviewButton shows "Review" in initial enabled state
- ReviewButton follows standard state machine
- No "Under Review" label appears at any point

---

### Task 12: Integrate ReviewButton with NPDWorkflow
**Requirements:** 6, 11, 12  
**Description:** Wire ReviewButton callbacks to workflowService and ValidationEngine in NPDWorkflow component.

**Subtasks:**
- [~] 12.1 Update `buildNodes()` in NPDWorkflow to pass `reviewState` and `validationResult` to node data
- [~] 12.2 Implement `handleUploadClick(nodeId)` to open UploadModal for specific stage
- [~] 12.3 Implement `handleReviewStart(nodeId)` to call `workflowService.setReviewState(projectId, nodeId, 'reviewing', ...)`
- [~] 12.4 Implement `handleReviewed(nodeId, validationResult)` to call `workflowService.setReviewState(projectId, nodeId, 'reviewed', ...)` and `workflowService.setValidationResult(projectId, nodeId, validationResult)`
- [~] 12.5 Pass `onUploadClick`, `onReviewStart`, `onReviewed` callbacks to WorkflowProcessNode
- [~] 12.6 Ensure callbacks trigger React state updates to re-render nodes with new data
- [~] 12.7 Test that ReviewButton state persists across page reload

**Acceptance:**
- Clicking TopSection opens UploadModal for correct stage
- Clicking ReviewButton triggers `onReviewStart` callback
- ReviewButton completing review triggers `onReviewed` callback with validation result
- ReviewState and ValidationResult persist to localStorage
- Node re-renders with updated state after callbacks
- State survives page reload

---

## Phase 4: Visual Design and Animations

### Task 13: Apply Visual Design Standards to DevConsole
**Requirements:** 9  
**Description:** Apply color palette, typography, spacing, and animations to DevConsole component.

**Subtasks:**
- [~] 13.1 Apply color palette: background #0f172a, header #1e293b, borders #334155, text #f1f5f9
- [~] 13.2 Apply accent colors: purple #a78bfa, success #4ade80, failure #f87171, warning #fbbf24
- [~] 13.3 Set font family to `'JetBrains Mono', 'Fira Code', monospace`
- [~] 13.4 Apply typography: header 13px/700, stats 16px/800, results 11px/600, logs 11px monospace
- [~] 13.5 Set panel width to 520px
- [~] 13.6 Apply section padding: 8px–16px, button gap 6px, border radius 6px–10px
- [~] 13.7 Add button hover animation: `opacity 0.15s ease`
- [~] 13.8 Add panel transition: `all 0.2s ease`

**Acceptance:**
- DevConsole matches design color palette
- Typography is consistent across all sections
- Spacing and dimensions match design specs
- Animations are smooth and match timing specs

---

### Task 14: Apply Visual Design Standards to WorkflowNodes
**Requirements:** 9  
**Description:** Apply SplitNode styling, colors, animations, and ReviewButton design to workflow nodes.

**Subtasks:**
- [~] 14.1 Set SplitNode width to 200px, section min height to 64px
- [~] 14.2 Add 1px horizontal divider with `rgba(0,0,0,0.1)` color
- [~] 14.3 Set border radius to 10px, border to 2.5px solid (status-dependent)
- [~] 14.4 Apply TopSection background from `NODE_ACCENT` map or green (#16a34a) for validation pass
- [~] 14.5 Set TopSection text: 13px, font-weight 800, color #ffffff
- [~] 14.6 Set TopSection padding: 9px 14px, cursor: pointer
- [~] 14.7 Add TopSection hover: `translateY(-3px) scale(1.02)`, transition 0.18s ease
- [~] 14.8 Add TopSection background-color transition: 0.3s ease
- [~] 14.9 Set BottomSection padding: 8px 14px
- [~] 14.10 Style ReviewButton: border-radius 6px, padding 6px 12px, font 11px/700
- [~] 14.11 Apply ReviewButton disabled state: opacity 50%, pointer-events none
- [~] 14.12 Apply ReviewButton transition: `background-color 0.15s ease`
- [~] 14.13 Implement spinner animation: 360° rotation per second using CSS keyframes
- [~] 14.14 Apply Marketing_Input_Node styling: 200px width, 80px min height, teal background, 2.5px border

**Acceptance:**
- SplitNode dimensions and layout match design specs
- TopSection background color transitions smoothly
- Hover animations work correctly
- ReviewButton styling matches design
- Spinner animation is smooth
- Marketing_Input_Node styling is consistent

---

### Task 15: Verify Vertical Workflow and Edge Preservation
**Requirements:** 10  
**Description:** Ensure all existing flowchart connections, node positions, and special node shapes are preserved.

**Subtasks:**
- [~] 15.1 Verify all edges from `buildEdges()` are rendered correctly
- [~] 15.2 Verify all node positions from `POSITIONS` map are unchanged
- [~] 15.3 Verify WorkflowDecisionNode (`acceptance`) retains diamond shape
- [~] 15.4 Verify WorkflowOvalNode (`project`, `end`) retains pill/oval shape
- [~] 15.5 Test that ReactFlow canvas displays all nodes and edges without layout shift
- [~] 15.6 Verify all edge connections remain intact after node redesign

**Acceptance:**
- All edges are rendered at original positions
- All nodes are positioned correctly
- Decision node has diamond shape
- Oval nodes have pill shape
- No layout shifts occur on canvas render
- All edge connections are functional

---

## Phase 5: Integration and Testing

### Task 16: Implement File Upload Integration
**Requirements:** 5  
**Description:** Ensure UploadModal integration works correctly with TopSection clicks and file persistence.

**Subtasks:**
- [~] 16.1 Verify UploadModal opens when TopSection is clicked
- [~] 16.2 Verify UploadModal accepts file types: PDF, DOCX, XLSX, PPTX, PNG, JPG, JPEG
- [~] 16.3 Verify UploadModal enforces 10 MB max file size
- [~] 16.4 Verify UploadModal enforces 20 files per stage limit
- [~] 16.5 Verify file upload persists to localStorage via workflowService
- [~] 16.6 Verify TopSection displays file count badge after upload
- [~] 16.7 Verify error messages display for file size/type/count violations
- [~] 16.8 Verify UploadModal is dismissible via close button or Escape key

**Acceptance:**
- UploadModal opens on TopSection click
- File type, size, and count validations work correctly
- Files persist to localStorage
- File count badge displays correctly
- Error messages are user-friendly
- Modal can be dismissed without uploading

---

### Task 17: Test ReviewButton State Persistence
**Requirements:** 6  
**Description:** Verify ReviewButton state survives page reload by reading from localStorage.

**Subtasks:**
- [~] 17.1 Upload file to a stage and verify ReviewButton becomes enabled
- [~] 17.2 Click ReviewButton and wait for "Reviewed" state
- [~] 17.3 Reload page and verify ReviewButton still shows "Reviewed" state
- [~] 17.4 Verify TopSection background color persists if validation passed
- [~] 17.5 Remove all files from stage and verify ReviewButton resets to disabled state
- [~] 17.6 Reload page and verify ReviewButton remains disabled

**Acceptance:**
- ReviewButton state persists across page reload
- Validation result (green TopSection) persists across page reload
- Removing files resets ReviewButton to disabled state
- Reset state persists across page reload

---

### Task 18: Test Validation Integration End-to-End
**Requirements:** 11  
**Description:** Test complete validation flow from ReviewButton click to TopSection color change.

**Subtasks:**
- [~] 18.1 Set up test scenario: upload files to upstream nodes and mark as reviewed
- [~] 18.2 Upload file to current node and click ReviewButton
- [~] 18.3 Verify ValidationEngine retrieves upstream node data correctly
- [~] 18.4 Verify validation rules execute during "Reviewing…" state
- [~] 18.5 Verify TopSection turns green when validation passes
- [~] 18.6 Verify TopSection remains original color when validation fails
- [~] 18.7 Verify BottomSection displays "File Reviewed" after review completes
- [~] 18.8 Verify validation result persists to localStorage
- [~] 18.9 Reload page and verify TopSection color persists

**Acceptance:**
- Validation runs during review process
- TopSection color changes based on validation result
- BottomSection displays "File Reviewed" status
- Validation result persists across page reload
- Upstream node data is retrieved correctly

---

### Task 19: Test Error Handling for WorkflowNode
**Requirements:** 5, 6, 12  
**Description:** Verify error handling for UploadModal failures, ReviewButton callback failures, and localStorage quota exceeded.

**Subtasks:**
- [~] 19.1 Test UploadModal open failure: verify inline error message displays in node body
- [~] 19.2 Test ReviewButton callback errors: verify errors are logged and state machine continues
- [~] 19.3 Test localStorage quota exceeded: verify toast notification and state revert
- [~] 19.4 Test ReviewState hydration with missing data: verify defaults to 'idle'
- [~] 19.5 Test ReviewState hydration with invalid data: verify defaults to 'idle' and logs warning

**Acceptance:**
- UploadModal failures display inline error messages
- ReviewButton callback errors don't interrupt state machine
- localStorage quota errors display toast and revert state
- Missing/invalid ReviewState data defaults gracefully
- All errors are logged appropriately

---

### Task 20: Manual Testing and Final Verification
**Requirements:** All  
**Description:** Perform comprehensive manual testing of all features and verify against requirements.

**Subtasks:**
- [~] 20.1 Test DevConsole "TEST ALL" button runs all suites
- [~] 20.2 Test results grouped into WORKING / NOT WORKING sections
- [~] 20.3 Test stats bar displays correct counts and percentage
- [~] 20.4 Test success % color-coded (green ≥ 80%, red < 80%)
- [~] 20.5 Test export JSON/TXT produces valid files
- [~] 20.6 Test WorkflowProcessNode split into TopSection + BottomSection
- [~] 20.7 Test TopSection click opens UploadModal
- [~] 20.8 Test file upload enables ReviewButton
- [~] 20.9 Test ReviewButton progresses: Review → Reviewing… → File Reviewed
- [~] 20.10 Test ReviewButton state persists after page reload
- [~] 20.11 Test TopSection turns green when validation passes
- [~] 20.12 Test Marketing_Input_Node single-section layout
- [~] 20.13 Test Marketing_Input_Node shows "File Uploaded" after upload
- [~] 20.14 Test all ReactFlow edges and positions preserved
- [~] 20.15 Test node hover animations smooth (0.18s ease)
- [~] 20.16 Test ReviewButton spinner rotates during "Reviewing…" state
- [~] 20.17 Test Review Against Quotation node shows "Review" label (not "Under Review")
- [~] 20.18 Test validation against upstream nodes works correctly
- [~] 20.19 Test removing files resets ReviewButton to disabled state
- [~] 20.20 Test all error scenarios display appropriate messages

**Acceptance:**
- All manual test cases pass
- All requirements are satisfied
- No regressions in existing functionality
- UI matches design specifications
- All animations are smooth
- Error handling is robust

---

## Notes

### Dependencies Between Tasks
- Task 6 must be completed before Task 8 (ReviewButton needs ReviewState types)
- Task 7 must be completed before Task 8 (ReviewButton needs ValidationEngine)
- Task 8 must be completed before Task 9 (SplitNode needs ReviewButton component)
- Tasks 1-5 (DevConsole) can be completed independently of Tasks 6-15 (Flowchart)
- Task 12 requires Tasks 6, 7, 8, 9 to be completed
- Tasks 13-15 (Visual Design) can be done in parallel with functional tasks
- Tasks 16-19 (Integration Testing) require all functional tasks to be completed
- Task 20 (Manual Testing) must be done last

### Testing Strategy
- Unit tests should be written for TestEngine, ValidationEngine, and ReviewButton
- Integration tests should cover DevConsole + TestEngine and WorkflowNode + WorkflowService
- Manual testing checklist in Task 20 covers all requirements
- Property-based testing is not required for this feature

### Implementation Order Recommendation
1. **Phase 1** (Tasks 1-5): Complete DevConsole simplification first as it's independent
2. **Phase 2** (Tasks 6-8): Build core infrastructure for node redesign
3. **Phase 3** (Tasks 9-12): Implement SplitNode layout and integration
4. **Phase 4** (Tasks 13-15): Apply visual design and verify topology
5. **Phase 5** (Tasks 16-20): Integration testing and final verification
