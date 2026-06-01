# Implementation Plan: VA/VE Pump Type Selection

## Overview

This implementation transforms the VA/VE module to match the NPD module's pump category selection workflow. The approach involves refactoring the existing VAVEProjects page into a pump selection landing page, creating a new category-specific projects page, implementing a VA/VE-specific flowchart with 12 Value Engineering stages, and extending the ProjectWorkspace to conditionally render the appropriate workflow based on module type.

## Tasks

- [ ] 1. Set up routing infrastructure
  - Add `/vave/:categoryId` route in App.tsx for category-specific project views
  - Configure route to render VAVECategoryProjects component
  - Ensure route parameters are properly typed
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 2. Refactor VAVEProjects component to pump selection landing page
  - [ ] 2.1 Transform VAVEProjects.tsx from project list to pump category grid
    - Remove existing project list, search, and filter UI
    - Import and use pump category grid layout from NPDProjects.tsx pattern
    - Implement `getPumpCategoriesForModule('vave')` to load VA/VE-applicable categories
    - Calculate project counts per category using `projectService.getProjectsByModule('vave')`
    - Render responsive grid of pump category cards with images, names, and project count badges
    - Add click handlers to navigate to `/vave/:categoryId`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 10.1_

- [ ] 3. Create VAVECategoryProjects component for category-specific project management
  - [ ] 3.1 Implement VAVECategoryProjects.tsx component
    - Create new file at `src/features/vave/pages/VAVECategoryProjects.tsx`
    - Clone structure from NPDCategoryProjects.tsx
    - Extract categoryId from URL params using useParams hook
    - Load pump category details using `getPumpCategoryById(categoryId)`
    - Display category info banner with pump image and name
    - Implement project filtering by category and module type
    - Add ProjectSearch component for search and status filtering
    - Add "Create Project" button that opens ProjectForm modal with category pre-selected
    - Render ProjectCard components for each project
    - Implement edit/delete handlers using projectService
    - Add navigation to ProjectWorkspace on project card click
    - Add back button to navigate to `/vave`
    - Handle category not found error state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 7.2, 7.3, 7.4, 9.1, 10.2, 10.3, 10.4_

- [ ] 4. Checkpoint - Verify navigation and project management
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create VAVEWorkflow component with Value Engineering flowchart
  - [ ] 5.1 Implement VAVEWorkflow.tsx component structure
    - Create new file at `src/features/vave/components/VAVEWorkflow.tsx`
    - Clone base structure from NPDWorkflow.tsx
    - Set up ReactFlow provider and configuration
    - Import workflow node types: WorkflowProcessNode, WorkflowDecisionNode, WorkflowOvalNode
    - Implement WorkflowNodeData interface with status, file count, and criteria tracking
    - Add projectId prop and load workflow state using workflowService
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ] 5.2 Define VA/VE stage configuration
    - Define VAVE_STAGES constant with 12 stage IDs and labels: project, cost-driver, function-analysis, material-review, component-optimization, supplier-evaluation, manufacturing-improvement, reliability-assessment, cost-saving-validation, management-approval, implementation, savings-verification, project-closure
    - Define TYPE_MAP for node types (oval for start/end, process for standard stages, decision for optimization and validation)
    - Define POSITIONS object with x/y coordinates for horizontal flow layout with decision branches
    - Define NODE_ACCENT colors for each stage (green for start/end, varied colors for stages)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 9.4, 9.5, 9.6_

  - [ ] 5.3 Implement edge connections and decision logic
    - Define VAVE_EDGES array with all stage connections
    - Add decision branch edges: component-optimization YES→supplier-evaluation, NO→material-review
    - Add decision branch edges: cost-saving-validation YES→management-approval, NO→function-analysis
    - Configure edge styling with thick teal arrows matching NPD pattern
    - Add edge labels for decision branches (YES/NO)
    - _Requirements: 4.4, 4.5, 9.6_

  - [ ] 5.4 Integrate stage interaction handlers
    - Implement node click handler to open StagePanel
    - Integrate file upload functionality using existing StagePanel component
    - Integrate review workflow (reviewing → approved/rejected) using existing patterns
    - Integrate criteria marking and progress tracking
    - Add DocumentsPanel for viewing all files across stages
    - Add WorkflowMetrics component for progress indicators
    - Implement workflow state persistence using workflowService
    - _Requirements: 4.5, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [ ] 6. Extend ProjectWorkspace to support multiple workflow types
  - [ ] 6.1 Add conditional workflow rendering to ProjectWorkspace.tsx
    - Import VAVEWorkflow component
    - Extract moduleType from URL params or project data
    - Add conditional rendering: render NPDWorkflow for 'npd', VAVEWorkflow for 'vave', StandardizationWorkflow for 'standardization'
    - Ensure all existing layout, header, and info cards remain unchanged
    - Handle workflow load failure error states
    - _Requirements: 4.1, 4.2, 4.3, 7.3, 8.1, 8.2, 8.3, 8.4_

- [ ] 7. Update project data model to include pump category
  - [ ] 7.1 Extend Project interface with pumpCategory field
    - Add optional `pumpCategory?: PumpCategoryId` field to Project interface in types/index.ts
    - Ensure projectService.createProject accepts and stores pumpCategory
    - Update project creation in VAVECategoryProjects to include categoryId
    - _Requirements: 3.1, 3.2, 10.2, 10.4, 10.5_

- [ ] 8. Checkpoint - Verify end-to-end workflow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Add error handling and edge cases
  - [ ] 9.1 Implement error states in VAVECategoryProjects
    - Add category not found error display with back button
    - Add project load failure error handling
    - Add project creation failure error handling with user feedback
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.2 Implement error states in VAVEWorkflow
    - Add workflow state load failure handling with fallback to default state
    - Add graceful degradation for missing stage data
    - _Requirements: 4.1, 4.4_

  - [ ] 9.3 Handle legacy projects without pump category
    - Add null check for pumpCategory field in project filtering
    - Display uncategorized projects appropriately if needed
    - _Requirements: 10.4, 10.5_

- [ ] 10. Verify module isolation and visual consistency
  - [ ] 10.1 Test NPD module functionality
    - Verify NPD projects page still works correctly
    - Verify NPD category projects page still works correctly
    - Verify NPD workflow renders correctly in workspace
    - Ensure no regressions in NPD module
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.2 Test Standardization module functionality
    - Verify Standardization module still works correctly
    - Ensure no regressions in Standardization module
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.3 Verify visual consistency across modules
    - Verify VA/VE pump selection cards match NPD styling
    - Verify VA/VE flowchart styling matches NPD patterns
    - Verify hover effects and responsive design work correctly
    - Test on mobile and tablet viewports
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 11. Final checkpoint - Complete integration testing
  - Test complete flow: Dashboard → VA/VE → Select Category → Create Project → Workspace → VA/VE Flowchart
  - Test stage interactions: click node → upload files → mark criteria → review workflow
  - Test data persistence: reload page and verify workflow state persists
  - Test navigation: verify all back buttons work correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- This implementation reuses 80% of existing components and services (20 out of 25 components)
- The VA/VE flowchart has 12 stages compared to NPD's 16 stages
- All workflow interaction patterns (file upload, review workflow, criteria marking) are identical to NPD
- The design document does not include a Correctness Properties section, so property-based tests are not applicable
- Focus on integration tests to verify module isolation and end-to-end flows
- Existing VA/VE projects without a pumpCategory field should be handled gracefully
- The implementation maintains backward compatibility with existing project data

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "5.1"] },
    { "id": 3, "tasks": ["5.2"] },
    { "id": 4, "tasks": ["5.3", "7.1"] },
    { "id": 5, "tasks": ["5.4", "6.1"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
