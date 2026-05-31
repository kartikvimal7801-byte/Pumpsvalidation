# The Documents — PumpValidation Project

This folder contains a snapshot of all key source files, specs, and config documents for the **Havells Pump Validation (NPD Web Application)** project.

---

## 📁 Folder Structure

```
the documents/
├── README.md                        ← This file
├── CREDENTIALS.md                   ← Login credentials
│
├── specs/                           ← Kiro spec documents
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
│
├── config/                          ← Project configuration files
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   └── Index.html
│
└── src/                             ← All source code
    ├── App.tsx
    ├── main.tsx
    │
    ├── components/
    │   ├── common/                  ← Shared UI components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── HavellsLogo.tsx
    │   │   ├── Input.tsx
    │   │   ├── Modal.tsx
    │   │   └── index.ts
    │   └── project/                 ← Project list components
    │       ├── ProjectCard.tsx
    │       ├── ProjectForm.tsx
    │       └── ProjectSearch.tsx
    │
    ├── data/                        ← Static data / mock data
    │   ├── authorizedUsers.ts
    │   ├── mockProjects.ts
    │   └── pumpCategories.ts
    │
    ├── features/
    │   ├── auth/                    ← Login & auth guard
    │   │   ├── AuthGuard.tsx
    │   │   ├── AuthContext.tsx
    │   │   └── LoginPage.tsx
    │   │
    │   ├── common/                  ← Shared pages
    │   │   ├── ProjectWorkspace.tsx
    │   │   └── PumpCategorySelect.tsx
    │   │
    │   ├── dashboard/               ← Main dashboard
    │   │   ├── ModuleCard.tsx
    │   │   └── Dashboard.tsx
    │   │
    │   ├── npd/                     ← NPD module (flowchart + workflow)
    │   │   ├── NPDWorkflow.tsx      ← Main flowchart canvas
    │   │   ├── WorkflowNode.tsx     ← Node components (process/decision/oval)
    │   │   ├── StagePanel.tsx       ← Stage detail slide-in panel
    │   │   ├── DocumentsPanel.tsx   ← All-documents folder panel
    │   │   ├── WorkflowMetrics.tsx  ← Metrics bar
    │   │   ├── NPDFlowchart.tsx     ← Editable flowchart (drag & drop)
    │   │   ├── FlowchartNodes.tsx   ← Flowchart node types
    │   │   ├── NPDProjects.tsx
    │   │   ├── NPDCategoryProjects.tsx
    │   │   └── NPDProjectDetail.tsx
    │   │
    │   ├── standardization/
    │   │   └── StandardizationProjects.tsx
    │   │
    │   └── vave/
    │       └── VAVEProjects.tsx
    │
    ├── services/                    ← Business logic / data services
    │   ├── authService.ts
    │   ├── projectService.ts
    │   └── workflowService.ts       ← File upload, stage approval, audit trail
    │
    ├── styles/
    │   └── index.css
    │
    ├── types/
    │   └── index.ts                 ← Shared TypeScript types
    │
    └── utils/
        └── index.ts                 ← Utility helpers
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `specs/requirements.md` | Full feature requirements |
| `specs/design.md` | Technical design document |
| `specs/tasks.md` | Implementation task list |
| `src/features/npd/NPDWorkflow.tsx` | Main flowchart with node positions & edges |
| `src/features/npd/WorkflowNode.tsx` | Visual design of all node types |
| `src/features/npd/StagePanel.tsx` | File upload & validation per stage |
| `src/features/npd/DocumentsPanel.tsx` | Centralised documents folder view |
| `src/services/workflowService.ts` | All workflow state, file storage, audit logic |
| `src/data/authorizedUsers.ts` | User credentials & roles |

---

## 🚀 Running the Project

```bash
cd PumpVlidation
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

*Snapshot generated: May 2026*
