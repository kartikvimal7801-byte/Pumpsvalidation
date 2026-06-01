# Requirements Document

## Introduction

This feature covers two major improvements to the NPD web application:

1. **Developer Tester Simplification** — Replace the existing multi-button developer testing console with a single "TEST ALL" button that runs all test suites automatically and presents results in a simplified two-section layout (WORKING / NOT WORKING) plus summary statistics.

2. **Flowchart Node Redesign** — Redesign every workflow node except the first node ("Marketing Input / RFQ") to use a split two-section layout: a clickable top section (stage name) that opens a file upload modal, and a bottom section containing a status button that progresses through Review → Reviewing… → Reviewed states, gated by file upload completion.

The application is a React + TypeScript + ReactFlow project using Tailwind CSS and localStorage for persistence. Existing routing, edge connections, and the overall vertical workflow topology must be preserved.

---

## Glossary

- **DevConsole**: The floating developer testing panel rendered only in development mode (`import.meta.env.DEV`).
- **TestEngine**: The `testEngine.ts` module that registers and runs test suites across categories: navigation, buttons, forms, flowchart, files, api, database.
- **TestResult**: A single test outcome with fields: id, name, category, status (`pass | fail | warning | skipped`), message, detail, duration, timestamp.
- **WorkflowNode**: A ReactFlow custom node component rendered inside `NPDWorkflow.tsx`.
- **SplitNode**: The new two-section node design applied to all workflow nodes except `marketing-input`.
- **TopSection**: The upper half of a SplitNode displaying the stage name; clicking it opens the Upload Modal.
- **BottomSection**: The lower half of a SplitNode containing the Review Status Button.
- **ReviewButton**: The interactive button in the BottomSection that cycles through states: `idle → reviewing → reviewed`.
- **UploadModal**: A modal dialog that allows the user to upload files for a specific workflow stage.
- **Marketing_Input_Node**: The `marketing-input` node — exempt from the SplitNode redesign; retains its existing single-section layout with a "File Uploaded" status indicator after upload.
- **WorkflowService**: The `workflowService` module managing stage state, file uploads, and persistence in localStorage.
- **NodeStatus**: The existing status type from `workflowService`: `idle | uploaded | partial | approved | rejected`.
- **ReviewState**: The new per-node review lifecycle state: `idle | reviewing | reviewed`.
- **ValidationResult**: The outcome of parameter validation during review: `pass | fail | pending`.
- **UpstreamNode**: A workflow node that has an outgoing edge connecting to the current node.

---

## Requirements

### Requirement 1: Single "TEST ALL" Button

**User Story:** As a developer, I want a single "TEST ALL" button in the developer console, so that I can run all test suites with one click without having to click individual category buttons.

#### Acceptance Criteria

1. THE DevConsole SHALL display exactly one primary action button labelled "TEST ALL".
2. WHEN the user clicks "TEST ALL", THE DevConsole SHALL execute all registered test suites in the TestEngine sequentially without requiring any additional user input.
3. THE DevConsole SHALL NOT display individual per-category run buttons (Navigation, Buttons, Forms, Flowchart, Files, API, Database) as separate action buttons.
4. WHILE tests are running, THE DevConsole SHALL display a "RUNNING…" indicator and disable the "TEST ALL" button to prevent concurrent test runs.
5. WHEN all suites have completed, THE DevConsole SHALL re-enable the "TEST ALL" button and display a summary showing total passed and total failed counts.
6. IF a test suite throws an unhandled error during execution, THEN THE DevConsole SHALL record that suite's tests as failed, continue executing remaining suites, and re-enable the "TEST ALL" button upon completion.

---

### Requirement 2: Simplified Results Display — WORKING / NOT WORKING

**User Story:** As a developer, I want test results shown in only two sections (WORKING and NOT WORKING), so that I can immediately identify what is functional and what needs attention.

#### Acceptance Criteria

1. WHEN tests have completed, THE DevConsole SHALL display results grouped into exactly two sections: "WORKING" (status = `pass`) and "NOT WORKING" (status = `fail`).
2. THE DevConsole SHALL NOT display separate "Warnings" or "Skipped" sections as top-level result groups.
3. IF a test result has status `warning` or `skipped`, THEN THE DevConsole SHALL place it in the "WORKING" section and display a visible text label showing the status value (e.g., "warning" or "skipped") adjacent to the result name.
4. WHEN the "WORKING" section contains zero items, THE DevConsole SHALL display a message communicating that no passing or warning/skipped tests were found.
5. WHEN the "NOT WORKING" section contains zero items, THE DevConsole SHALL display a message communicating that all tests passed successfully.
6. IF a test result has a status value other than `pass`, `fail`, `warning`, or `skipped`, THEN THE DevConsole SHALL place it in the "NOT WORKING" section and display a visible text label showing the unrecognised status value adjacent to the result name.

---

### Requirement 3: Summary Statistics Bar

**User Story:** As a developer, I want to see summary statistics after running tests, so that I can quickly assess overall application health.

#### Acceptance Criteria

1. WHEN tests have completed, THE DevConsole SHALL display the following four statistics: Total Tests, Passed Tests, Failed Tests, and Success Percentage.
2. THE DevConsole SHALL calculate Success Percentage as `floor((passedTests / totalTests) × 100)`, displaying it as a whole-number percentage.
3. IF total tests equals zero, THEN THE DevConsole SHALL display "0%" for Success Percentage rather than a division-by-zero error.
4. WHILE tests are running, THE DevConsole SHALL update the statistics within 100ms of receiving each TestResult via the `onProgress` callback.
5. IF the Success Percentage is ≥ 80, THEN THE DevConsole SHALL render the percentage value in green text; IF the Success Percentage is < 80, THEN THE DevConsole SHALL render the percentage value in red text.
6. WHEN no test run has been initiated or after results are cleared, THE DevConsole SHALL NOT display the statistics bar.

---

### Requirement 4: SplitNode Layout for Redesigned Nodes

**User Story:** As an engineer, I want each workflow node (except Marketing Input / RFQ) to be visually split into a stage-name area and a status area, so that the purpose of each section is immediately clear.

#### Acceptance Criteria

1. THE WorkflowNode SHALL render a TopSection and a BottomSection separated by a horizontal divider of at least 1px height for all nodes except the `marketing-input` node; the `marketing-input` node SHALL render without any TopSection, BottomSection, or divider.
2. THE TopSection SHALL display the stage name in large, readable text (minimum 13px, font-weight ≥ 700).
3. THE BottomSection SHALL contain the ReviewButton; WHEN no review action is applicable for a node, THE ReviewButton SHALL render in a disabled state rather than be hidden.
4. THE WorkflowNode SHALL maintain consistent node sizing across all redesigned nodes, with a fixed width of 200px and a minimum height of 64px per section to accommodate content without truncation.
5. THE WorkflowNode SHALL preserve all existing ReactFlow Handle positions (Top, Bottom, Left, Right) including named source and target variants for each position so that existing edge connections remain intact.

---

### Requirement 5: Upload via TopSection Click

**User Story:** As an engineer, I want to upload documents by clicking the stage name area of a node, so that the upload action is clearly associated with the stage content rather than the status button.

#### Acceptance Criteria

1. WHEN the user clicks the WorkflowProcessNode header section, THE WorkflowNode SHALL open the UploadModal for that specific stage.
2. THE UploadModal SHALL accept files of types PDF, DOCX, XLSX, PPTX, PNG, JPG, and JPEG, with a maximum size of 10 MB per file and a maximum of 20 files per stage.
3. WHEN a file upload completes successfully, THE WorkflowService SHALL persist the file to localStorage under the correct project and stage key.
4. WHEN at least one file has been uploaded to a stage, THE WorkflowProcessNode header section SHALL display the uploaded file count (e.g., "3 files") alongside the stage name.
5. IF a file upload fails because the file exceeds 10 MB or the 20-file limit is reached, THEN THE UploadModal SHALL display an error message stating the specific limit that was exceeded.
6. IF the user selects a file with a type not in the accepted list, THEN THE UploadModal SHALL reject the file and display an error message listing the accepted file types.
7. THE UploadModal SHALL be dismissible without uploading by clicking a close button or pressing the Escape key.

---

### Requirement 6: Review Status Button Logic

**User Story:** As an engineer, I want the Review button to be locked until a file is uploaded, then progress through Review → Reviewing… → Reviewed states, so that the review workflow is enforced.

#### Acceptance Criteria

1. WHEN a stage has zero uploaded files, THE ReviewButton SHALL render with opacity ≤ 50%, pointer-events set to none, and the HTML disabled attribute set, and SHALL NOT respond to click events.
2. WHEN at least one file has been uploaded to a stage, THE ReviewButton SHALL become enabled (opacity 100%, pointer-events auto, disabled attribute removed) and display the label "Review".
3. WHEN the user clicks an enabled ReviewButton, THE ReviewButton SHALL immediately change its label to "Reviewing…", display a loading spinner, set opacity to 100%, set pointer-events to none, and set the disabled attribute to prevent further interaction during this period.
4. WHEN the ReviewButton has been in the "Reviewing…" state for 3 seconds, THE ReviewButton SHALL change its label to "Reviewed", remove the spinner, set pointer-events to none, and set the disabled attribute to lock the button.
5. WHEN the ReviewButton transitions into the "Reviewed" state, THE WorkflowService SHALL persist the `reviewed` ReviewState for that stage in localStorage.
6. THE ReviewButton state SHALL survive page reload by reading the persisted ReviewState from localStorage on component mount.
7. WHEN all files are removed from a stage that is in the "Reviewed" state, THE ReviewButton SHALL reset to the enabled "Review" state (opacity 100%, pointer-events auto, disabled attribute removed).

---

### Requirement 7: Marketing Input / RFQ Node Special Behaviour

**User Story:** As an engineer, I want the Marketing Input / RFQ node to retain its single-section layout and show "File Uploaded" after upload, so that it remains visually distinct as the entry point of the workflow.

#### Acceptance Criteria

1. THE Marketing_Input_Node SHALL NOT be split into TopSection and BottomSection.
2. WHEN the user single-clicks the Marketing_Input_Node body, THE WorkflowNode SHALL open the UploadModal for the `marketing-input` stage.
3. WHEN at least one file has been uploaded to the `marketing-input` stage, THE Marketing_Input_Node SHALL display the text "File Uploaded" as a status indicator positioned within the lower area of the node body.
4. WHEN zero files have been uploaded to the `marketing-input` stage, THE Marketing_Input_Node SHALL NOT display the "File Uploaded" indicator.
5. IF the UploadModal fails to open due to a component error, THEN THE Marketing_Input_Node SHALL display an inline error message within the node body.

---

### Requirement 8: Review Against Quotation Node Label

**User Story:** As an engineer, I want the Review Against Quotation node's status button to show "Review" (not "Under Review") after file upload, so that the label is consistent with the intended workflow terminology.

#### Acceptance Criteria

1. WHEN the `revert-quotation` stage NodeStatus is `uploaded`, THE ReviewButton for that node SHALL display the label "Review" in its initial enabled state.
2. THE `revert-quotation` node SHALL follow the same Review → Reviewing… → Reviewed state progression as all other SplitNodes.
3. THE `revert-quotation` node SHALL NOT display "Under Review" as a label in the ReviewButton or as a status text in the WorkflowProcessNode body at any point in the review lifecycle.

---

### Requirement 9: Visual Design Standards

**User Story:** As an engineer, I want the redesigned nodes to follow a professional engineering dashboard style with smooth animations, so that the flowchart looks polished and is easy to read.

#### Acceptance Criteria

1. THE WorkflowNode TopSection SHALL use a background colour value taken from the `NODE_ACCENT` map defined in `NPDWorkflow.tsx` for the corresponding node type.
2. WHEN the user hovers over a WorkflowNode, THE WorkflowNode SHALL apply a CSS transform of `translateY(-3px) scale(1.02)` with a transition of `0.18s ease`.
3. THE ReviewButton SHALL have a border-radius of at least 6px; WHEN the ReviewButton transitions between states, THE ReviewButton SHALL apply a background-color CSS transition of `0.15s ease`.
4. WHILE the ReviewButton is in the "Reviewing…" state, THE ReviewButton SHALL display a spinner element that completes one full 360° rotation per second using a CSS `@keyframes` or SVG animation.
5. THE WorkflowNode TopSection and BottomSection SHALL each have a minimum padding of 8px on all sides.

---

### Requirement 10: Vertical Workflow and Edge Preservation

**User Story:** As an engineer, I want all existing flowchart connections and the vertical workflow layout to be preserved after the node redesign, so that the process flow remains correct and readable.

#### Acceptance Criteria

1. THE NPDWorkflow SHALL preserve all existing edges defined in the `buildEdges` function after the node redesign, with no edges added or removed.
2. THE NPDWorkflow SHALL preserve all node `position` values defined in the `POSITIONS` map after the node redesign, with no coordinates changed.
3. THE WorkflowDecisionNode (`acceptance`) SHALL NOT be redesigned as a SplitNode and SHALL retain its diamond CSS shape.
4. THE WorkflowOvalNode (`project`, `end`) SHALL NOT be redesigned as a SplitNode and SHALL retain its pill/oval CSS shape.
5. WHEN the ReactFlow canvas renders after the node redesign, THE NPDWorkflow SHALL display all nodes and edges at their original positions without any layout shift.

---

### Requirement 11: Parameter Validation and Visual Feedback

**User Story:** As an engineer, I want the review process to validate current node parameters against previous nodes and provide visual feedback, so that I can see at a glance whether the review passed validation.

#### Acceptance Criteria

1. WHEN the user clicks the ReviewButton in the BottomSection, THE WorkflowService SHALL retrieve parameter data from all upstream nodes connected to the current node via incoming edges.
2. WHEN the ReviewButton enters the "Reviewing…" state, THE WorkflowService SHALL compare the current node's parameters with the parameters from all upstream nodes according to validation rules defined for that stage.
3. IF all validation checks pass, THEN WHEN the ReviewButton transitions to "Reviewed" state, THE TopSection background color SHALL change to green (#16a34a or equivalent success color).
4. IF any validation check fails, THEN WHEN the ReviewButton transitions to "Reviewed" state, THE TopSection background color SHALL remain unchanged (original NODE_ACCENT color).
5. WHEN the ReviewButton displays "Reviewed" status in the BottomSection, THE BottomSection SHALL display the text "File Reviewed" instead of just "Reviewed".
6. THE WorkflowService SHALL persist the validation result (pass/fail) along with the ReviewState in localStorage so that the TopSection color persists across page reloads.
7. WHEN a stage has been reviewed with validation passing, THE TopSection SHALL display a green background color on component mount by reading the persisted validation result from localStorage.

---

### Requirement 12: Future Business Logic Extensibility

**User Story:** As a developer, I want the ReviewButton architecture to support future business logic connections, so that the review state can be wired to downstream workflow actions without a full redesign.

#### Acceptance Criteria

1. WHEN the ReviewButton transitions to the `reviewed` state, THE ReviewButton SHALL invoke the `onReviewed` callback prop of type `(nodeId: string) => void` if it has been provided.
2. WHEN the ReviewButton transitions to the `reviewing` state, THE ReviewButton SHALL invoke the `onReviewStart` callback prop of type `(nodeId: string) => void` if it has been provided.
3. WHEN neither `onReviewed` nor `onReviewStart` is provided, THE ReviewButton SHALL complete its state transitions (idle → reviewing → reviewed) using only its internal state without throwing an error.
4. THE `ReviewState` type (`'idle' | 'reviewing' | 'reviewed'`) SHALL be exported as a named TypeScript type from the WorkflowNode module file.
5. IF an `onReviewed` or `onReviewStart` callback throws an error, THEN THE ReviewButton SHALL catch the error, log it to the console, and continue its internal state transition without interruption.
