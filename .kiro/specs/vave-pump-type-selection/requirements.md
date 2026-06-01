# Requirements Document

## Introduction

This feature implements the pump type selection workflow for the VA/VE (Value Analysis / Value Engineering) module, replicating the exact same user experience currently used in the NPD (New Product Development) module. The VA/VE module will display a pump category selection screen as the landing page, allow users to select a pump type, create a project, and then open the VA/VE-specific flowchart workspace.

## Glossary

- **VA/VE_Module**: The Value Analysis / Value Engineering module in the application
- **NPD_Module**: The New Product Development module in the application
- **Pump_Selection_Screen**: The landing page displaying all available pump categories as selectable cards
- **Pump_Category**: A specific type of pump (e.g., Self Priming Mini-Monoblock, Centrifugal Pump)
- **Project_Workspace**: The workspace view containing the flowchart and project details
- **VA/VE_Flowchart**: The Value Engineering workflow visualization with stages specific to value analysis
- **NPD_Flowchart**: The New Product Development workflow visualization
- **Dashboard**: The main application dashboard showing all modules
- **Project_Creation_Flow**: The sequence of steps from pump selection to project creation
- **PumpCategorySelect_Component**: The existing reusable component for displaying pump categories
- **VAVEProjects_Page**: The VA/VE projects listing page
- **ProjectWorkspace_Component**: The workspace component that displays flowcharts

## Requirements

### Requirement 1: VA/VE Landing Screen Replacement

**User Story:** As a user, I want to see the pump selection screen when I click the VA/VE module, so that I can choose the appropriate pump type for my value engineering project.

#### Acceptance Criteria

1. WHEN a user navigates to the VA/VE module from the Dashboard, THE VA/VE_Module SHALL display the Pump_Selection_Screen
2. THE Pump_Selection_Screen SHALL use the same PumpCategorySelect_Component used by the NPD_Module
3. THE Pump_Selection_Screen SHALL display all twelve pump categories: Self Priming Mini-Monoblock, Centrifugal Pump, Single Stage Pressure Pump, Multi-stage Booster Pump, Open Well Submersible Pump, 3-4 Inch Borewell Submersible Pump, 5-6-7-8 Inch Borewell Submersible Pump, Shallow Well Jet Pump, Deep Well Jet Pump, Sewage Submersible Pump, Inline Circulating Pump, Dewatering Submersible Pump
4. THE Pump_Selection_Screen SHALL use the same card layout, images, hover effects, and responsive design as the NPD_Module
5. THE Pump_Selection_Screen SHALL load pump images from the existing PumpImages folder

### Requirement 2: Pump Category Selection Behavior

**User Story:** As a user, I want to select a pump category with a single click, so that I can quickly proceed to create my VA/VE project.

#### Acceptance Criteria

1. WHEN a user clicks on a pump category card, THE VA/VE_Module SHALL highlight the selected card
2. WHEN a user clicks on a pump category card, THE VA/VE_Module SHALL store the selected pump type in the project data
3. WHEN a user clicks on a pump category card, THE VA/VE_Module SHALL open the project creation form
4. THE VA/VE_Module SHALL enable project creation after a pump category is selected
5. THE pump category selection behavior SHALL match the NPD_Module selection behavior exactly

### Requirement 3: VA/VE Project Creation

**User Story:** As a user, I want to create a VA/VE project after selecting a pump type, so that I can begin my value engineering analysis.

#### Acceptance Criteria

1. WHEN a user completes the project creation form, THE VA/VE_Module SHALL create a new project with the selected pump category
2. WHEN a project is created, THE VA/VE_Module SHALL store the pump category identifier in the project metadata
3. WHEN a project is created, THE VA/VE_Module SHALL navigate to the Project_Workspace
4. THE project creation form SHALL include fields for project name, owner, start date, and optional description
5. THE project creation process SHALL match the existing NPD_Module project creation flow

### Requirement 4: VA/VE Flowchart Workspace

**User Story:** As a user, I want to see the VA/VE flowchart when I open a VA/VE project, so that I can track my value engineering workflow stages.

#### Acceptance Criteria

1. WHEN a VA/VE project is opened, THE Project_Workspace SHALL display the VA/VE_Flowchart
2. THE VA/VE_Flowchart SHALL NOT display the NPD_Flowchart stages
3. THE VA/VE_Flowchart SHALL display Value Engineering workflow stages
4. THE VA/VE_Flowchart SHALL use the same ReactFlow-based visualization architecture as the NPD_Flowchart
5. THE VA/VE_Flowchart SHALL support the same interaction patterns as the NPD_Flowchart (node selection, file upload, review workflow)

### Requirement 5: VA/VE Flowchart Stages

**User Story:** As a user, I want to see Value Engineering-specific stages in the VA/VE flowchart, so that I can follow the appropriate workflow for value analysis.

#### Acceptance Criteria

1. THE VA/VE_Flowchart SHALL include a Cost Driver Identification stage
2. THE VA/VE_Flowchart SHALL include a Function Analysis stage
3. THE VA/VE_Flowchart SHALL include a Material Review stage
4. THE VA/VE_Flowchart SHALL include a Component Optimization stage
5. THE VA/VE_Flowchart SHALL include a Supplier Evaluation stage
6. THE VA/VE_Flowchart SHALL include a Manufacturing Improvement stage
7. THE VA/VE_Flowchart SHALL include a Reliability Assessment stage
8. THE VA/VE_Flowchart SHALL include a Cost Saving Validation stage
9. THE VA/VE_Flowchart SHALL include a Management Approval stage
10. THE VA/VE_Flowchart SHALL include an Implementation stage
11. THE VA/VE_Flowchart SHALL include a Savings Verification stage
12. THE VA/VE_Flowchart SHALL include a Project Closure stage

### Requirement 6: Reuse Existing Architecture

**User Story:** As a developer, I want to reuse the existing NPD architecture for VA/VE, so that I maintain consistency and reduce code duplication.

#### Acceptance Criteria

1. THE VA/VE_Module SHALL reuse the existing PumpCategorySelect_Component
2. THE VA/VE_Module SHALL reuse the existing project creation service methods
3. THE VA/VE_Module SHALL reuse the existing file upload functionality
4. THE VA/VE_Module SHALL reuse the existing review button functionality
5. THE VA/VE_Module SHALL reuse the existing reviewing state management
6. THE VA/VE_Module SHALL reuse the existing reviewed state management
7. THE VA/VE_Module SHALL reuse the existing status indicators
8. THE VA/VE_Module SHALL reuse the existing pass/fail workflow logic
9. THE VA/VE_Module SHALL reuse the existing progress tracking functionality
10. THE VA/VE_Module SHALL reuse the existing activity logging functionality

### Requirement 7: Navigation Flow

**User Story:** As a user, I want a clear navigation path from the dashboard to my VA/VE project workspace, so that I can efficiently access my work.

#### Acceptance Criteria

1. WHEN a user clicks the VA/VE module card on the Dashboard, THE application SHALL navigate to the Pump_Selection_Screen
2. WHEN a user selects a pump category, THE application SHALL display the project creation form
3. WHEN a user creates a project, THE application SHALL navigate to the Project_Workspace with the VA/VE_Flowchart
4. WHEN a user clicks "Back to VA/VE Projects" in the workspace, THE application SHALL navigate to the VAVEProjects_Page
5. THE navigation flow SHALL maintain browser history for back button functionality

### Requirement 8: Module Isolation

**User Story:** As a developer, I want to ensure VA/VE changes do not affect NPD or Standardization modules, so that existing functionality remains stable.

#### Acceptance Criteria

1. THE implementation SHALL NOT modify NPD_Module functionality
2. THE implementation SHALL NOT modify Standardization module functionality
3. THE implementation SHALL NOT modify shared components in a way that breaks existing modules
4. THE implementation SHALL only add new VA/VE-specific components or extend existing components safely
5. THE implementation SHALL maintain the existing UI design language and styling

### Requirement 9: Visual Consistency

**User Story:** As a user, I want the VA/VE module to look and feel consistent with the rest of the application, so that I have a seamless experience.

#### Acceptance Criteria

1. THE Pump_Selection_Screen SHALL use the same card styling as the NPD_Module
2. THE Pump_Selection_Screen SHALL use the same hover effects as the NPD_Module
3. THE Pump_Selection_Screen SHALL use the same responsive grid layout as the NPD_Module
4. THE VA/VE_Flowchart SHALL use the same color scheme and styling as the NPD_Flowchart
5. THE VA/VE_Flowchart SHALL use the same node types (process, decision, oval) as the NPD_Flowchart
6. THE VA/VE_Flowchart SHALL use the same edge styling (thick teal arrows) as the NPD_Flowchart

### Requirement 10: Pump Category Data Integration

**User Story:** As a developer, I want to use the existing pump category data structure, so that I maintain data consistency across modules.

#### Acceptance Criteria

1. THE VA/VE_Module SHALL use the getPumpCategoriesForModule function from pumpCategories.ts
2. THE VA/VE_Module SHALL use the PumpCategoryId type for pump category identifiers
3. THE VA/VE_Module SHALL use the getPumpCategoryById function to retrieve category details
4. THE VA/VE_Module SHALL store pump category references in the same format as the NPD_Module
5. THE pump category data structure SHALL remain unchanged
