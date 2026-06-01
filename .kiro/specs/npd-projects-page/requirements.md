# Requirements Document

## Introduction

This feature enhances the NPD (New Product Development) Projects page in the PumpValidation application. When a user clicks the NPD card on the dashboard, they are taken to a dedicated NPD Projects page that displays all NPD projects in a responsive card layout. Users can search projects, create new ones via a modal form, and navigate into individual project workspaces by double-clicking a card. The feature also extends the shared `Project` data model and `projectService` to support the additional fields required by NPD projects: Project Owner, Start Date, and Description.

## Glossary

- **NPD_Page**: The dedicated page at route `/npd` that lists all NPD projects.
- **Project_Card**: A UI card component that displays summary information for a single project.
- **Create_Modal**: The modal dialog opened by the "+" button that collects data for a new project.
- **Project_Form**: The form inside the Create_Modal with fields for Project Name, Project Owner, Start Date, and Description.
- **Project**: A data record with fields: `id`, `name`, `moduleType`, `status`, `createdBy`, `createdAt`, `updatedAt`, `projectOwner`, `startDate`, `description`.
- **Project_Service**: The localStorage-backed mock service (`projectService.ts`) responsible for CRUD operations on projects.
- **Search_Bar**: The text input at the top of the NPD_Page used to filter projects by name or ID.
- **NPD_Workspace**: The project-specific workspace page at route `/npd/project/:id`.
- **Dashboard**: The main landing page at route `/` that shows module cards including the NPD card.

---

## Requirements

### Requirement 1: Navigate to NPD Page from Dashboard

**User Story:** As a user, I want to click the NPD card on the dashboard and be taken to the NPD Projects page, so that I can manage my NPD projects in a dedicated view.

#### Acceptance Criteria

1. WHEN the user clicks the NPD module card on the Dashboard, THE Dashboard SHALL navigate the user to the `/npd` route.
2. THE NPD_Page SHALL display a page title of "NPD Projects" in the header.
3. THE NPD_Page SHALL display a "Back to Dashboard" button that navigates the user to the `/` route when clicked.

---

### Requirement 2: Display Projects in Responsive Card Layout

**User Story:** As a user, I want to see all my NPD projects displayed as cards in a responsive grid, so that I can quickly scan and identify projects.

#### Acceptance Criteria

1. WHEN the NPD_Page loads, THE Project_Service SHALL fetch all projects with `moduleType === 'npd'` from localStorage.
2. WHEN projects are available, THE NPD_Page SHALL render each project as a Project_Card in a responsive grid with 1 column on mobile, 2 columns on tablet, and 3 columns on desktop.
3. WHEN no projects exist, THE NPD_Page SHALL display an empty-state message with a prompt to create the first project.
4. WHILE projects are loading, THE NPD_Page SHALL display a skeleton loading grid of 6 placeholder cards.
5. IF the project fetch fails, THEN THE NPD_Page SHALL display an error message and a "Retry" button that re-triggers the fetch.

---

### Requirement 3: Project Card Content

**User Story:** As a user, I want each project card to show key project details, so that I can identify projects at a glance without opening them.

#### Acceptance Criteria

1. THE Project_Card SHALL display the project's `name` as the card title.
2. THE Project_Card SHALL display the project's `projectOwner` field with a user icon.
3. THE Project_Card SHALL display the project's `createdAt` date formatted as "MMM D, YYYY" with a calendar icon.
4. THE Project_Card SHALL display the project's `status` as a color-coded badge (green for "active", blue for "completed", amber for "on-hold").
5. THE Project_Card SHALL display a hint text "Double-click to open workspace" at the bottom of the card.

---

### Requirement 4: Search Projects

**User Story:** As a user, I want to search projects by name, so that I can quickly find a specific project when many exist.

#### Acceptance Criteria

1. THE NPD_Page SHALL render a Search_Bar at the top of the project list area.
2. WHEN the user types in the Search_Bar, THE NPD_Page SHALL filter the displayed Project_Cards to only those whose `name` or `id` contains the search query (case-insensitive).
3. WHEN the search query is cleared, THE NPD_Page SHALL display all projects.
4. WHEN the search query matches no projects, THE NPD_Page SHALL display a "No projects match your filters" message.

---

### Requirement 5: Create New Project via "+" Button

**User Story:** As a user, I want to click a "+" button in the top-right corner of the page to open a modal and create a new project, so that I can add new NPD projects quickly.

#### Acceptance Criteria

1. THE NPD_Page SHALL render a "+" icon button in the top-right corner of the page header.
2. WHEN the user clicks the "+" button, THE NPD_Page SHALL open the Create_Modal.
3. WHEN the user presses the Escape key while the Create_Modal is open, THE Create_Modal SHALL close without saving.
4. WHEN the user clicks outside the Create_Modal, THE Create_Modal SHALL close without saving.

---

### Requirement 6: Project Form Fields

**User Story:** As a user, I want the create project modal to collect Project Name, Project Owner, Start Date, and Description, so that I can record all relevant information when starting a new project.

#### Acceptance Criteria

1. THE Project_Form SHALL include a required "Project Name" text input with a minimum length of 3 characters and a maximum length of 100 characters.
2. THE Project_Form SHALL include a required "Project Owner" text input with a minimum length of 2 characters and a maximum length of 100 characters.
3. THE Project_Form SHALL include a required "Start Date" date input.
4. THE Project_Form SHALL include an optional "Description" textarea with a maximum length of 500 characters.
5. IF the user submits the Project_Form with an empty required field, THEN THE Project_Form SHALL display a validation error message below the respective field.
6. IF the user submits the Project_Form with a "Project Name" shorter than 3 characters, THEN THE Project_Form SHALL display the message "Project name must be at least 3 characters".
7. WHEN the Create_Modal is opened, THE Project_Form SHALL reset all fields to empty values.

---

### Requirement 7: Save New Project

**User Story:** As a user, I want the new project to be saved and immediately appear as a card on the page, so that I can start working on it right away.

#### Acceptance Criteria

1. WHEN the user submits a valid Project_Form, THE Project_Service SHALL create a new project record with `moduleType: 'npd'`, `status: 'active'`, `createdBy` set to the current user's ID, and the submitted `name`, `projectOwner`, `startDate`, and `description` values.
2. WHEN the Project_Service successfully creates a project, THE NPD_Page SHALL append the new Project_Card to the project grid without a full page reload.
3. WHEN the Project_Service successfully creates a project, THE Create_Modal SHALL close automatically.
4. WHILE the Project_Form submission is in progress, THE Project_Form SHALL disable the submit button and display a loading indicator.
5. IF the Project_Service fails to create a project, THEN THE Project_Form SHALL display an error message inside the modal without closing it.

---

### Requirement 8: Extended Project Data Model

**User Story:** As a developer, I want the Project type and related service to support `projectOwner`, `startDate`, and `description` fields, so that NPD-specific project data is persisted and retrievable.

#### Acceptance Criteria

1. THE Project type in `src/types/index.ts` SHALL include optional fields: `projectOwner?: string`, `startDate?: Date`, and `description?: string`.
2. THE `CreateProjectRequest` type SHALL include optional fields: `projectOwner?: string`, `startDate?: Date`, and `description?: string`.
3. WHEN `projectService.createProject` is called with `projectOwner`, `startDate`, and `description` values, THE Project_Service SHALL persist those values in the created project record in localStorage.
4. WHEN `projectService.getProjectsByModule` is called, THE Project_Service SHALL return projects with their `projectOwner`, `startDate`, and `description` fields intact.

---

### Requirement 9: Navigate to NPD Project Workspace

**User Story:** As a user, I want to double-click a project card to open the project's workspace, so that I can work on the project details.

#### Acceptance Criteria

1. WHEN the user double-clicks a Project_Card on the NPD_Page, THE NPD_Page SHALL navigate to the route `/npd/project/{id}` where `{id}` is the project's `id`.
2. THE application router in `App.tsx` SHALL define a route `/npd/project/:id` that renders the NPD project workspace.
3. WHEN the user navigates to `/npd/project/:id` with a valid project ID, THE NPD_Workspace SHALL load and display the project workspace for that project.

---

### Requirement 10: Edit and Delete Projects

**User Story:** As a user, I want to edit or delete a project from its card's context menu, so that I can keep project information up to date and remove obsolete projects.

#### Acceptance Criteria

1. THE Project_Card SHALL display a three-dot (⋮) menu icon button in the top-right corner of the card.
2. WHEN the user clicks the three-dot menu icon, THE Project_Card SHALL display a dropdown menu with "Edit" and "Delete" options.
3. WHEN the user clicks "Edit" in the dropdown, THE NPD_Page SHALL open the Create_Modal pre-populated with the selected project's current `name`, `projectOwner`, `startDate`, and `description` values.
4. WHEN the user submits the edit form, THE Project_Service SHALL update the project record in localStorage and THE NPD_Page SHALL reflect the updated values in the Project_Card.
5. WHEN the user clicks "Delete" in the dropdown, THE NPD_Page SHALL display a confirmation prompt before deleting.
6. WHEN the user confirms deletion, THE Project_Service SHALL remove the project from localStorage and THE NPD_Page SHALL remove the corresponding Project_Card from the grid.
