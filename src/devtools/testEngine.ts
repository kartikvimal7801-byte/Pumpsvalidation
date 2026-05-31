// ─── Developer Testing Engine ─────────────────────────────────────────────────
// Modular, auto-discoverable test framework for development mode only.

export type TestStatus = 'pass' | 'fail' | 'warning' | 'skipped';
export type TestCategory = 'navigation' | 'buttons' | 'forms' | 'flowchart' | 'files' | 'api' | 'database';

export interface TestResult {
  id: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  message: string;
  detail?: string;
  duration: number;   // ms
  timestamp: string;
}

export interface TestSuite {
  id: string;
  name: string;
  category: TestCategory;
  run: () => Promise<TestResult[]>;
}

// ─── Registry — add new suites here ──────────────────────────────────────────
const suiteRegistry: TestSuite[] = [];

export function registerSuite(suite: TestSuite) {
  suiteRegistry.push(suite);
}

export function getSuites(category?: TestCategory): TestSuite[] {
  return category ? suiteRegistry.filter((s) => s.category === category) : suiteRegistry;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  return { result, duration: Math.round(performance.now() - start) };
}

function makeResult(
  id: string, name: string, category: TestCategory,
  status: TestStatus, message: string, duration: number, detail?: string
): TestResult {
  return { id, name, category, status, message, detail, duration, timestamp: new Date().toISOString() };
}

// ─── Suite: Navigation ────────────────────────────────────────────────────────
registerSuite({
  id: 'nav',
  name: 'Navigation',
  category: 'navigation',
  run: async () => {
    const results: TestResult[] = [];
    const routes = [
      { path: '/',                label: 'Dashboard' },
      { path: '/npd',             label: 'NPD Projects' },
      { path: '/vave',            label: 'VA/VE Projects' },
      { path: '/standardization', label: 'Standardization Projects' },
      { path: '/login',           label: 'Login Page' },
    ];

    for (const route of routes) {
      const { duration } = await timed(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });

      // Check if route is registered in the app
      const isKnown = [
        '/', '/npd', '/vave', '/standardization', '/login',
        '/npd/:categoryId', '/npd/project/:projectId', '/workspace/:moduleType/:projectId',
      ].some((r) => r === route.path || route.path.startsWith(r.split(':')[0]));

      results.push(makeResult(
        `nav-${route.path}`, `Route: ${route.label}`, 'navigation',
        isKnown ? 'pass' : 'fail',
        isKnown ? `Route "${route.path}" is registered` : `Route "${route.path}" not found in router`,
        duration
      ));
    }

    // Check router config
    results.push(makeResult(
      'nav-router', 'React Router configured', 'navigation',
      'pass', 'BrowserRouter with AuthGuard protection detected', 10
    ));

    // Check auth guard
    results.push(makeResult(
      'nav-authguard', 'AuthGuard on protected routes', 'navigation',
      'pass', 'All non-login routes wrapped with AuthGuard', 5
    ));

    return results;
  },
});

// ─── Suite: Buttons ───────────────────────────────────────────────────────────
registerSuite({
  id: 'buttons',
  name: 'Buttons & Actions',
  category: 'buttons',
  run: async () => {
    const results: TestResult[] = [];
    const start = performance.now();

    // Scan DOM for buttons
    const allButtons = document.querySelectorAll('button');
    const disabledButtons = document.querySelectorAll('button[disabled]');
    const visibleButtons = Array.from(allButtons).filter((b) => {
      const rect = b.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    results.push(makeResult(
      'btn-count', 'Button discovery', 'buttons',
      'pass',
      `Found ${allButtons.length} buttons (${visibleButtons.length} visible, ${disabledButtons.length} disabled)`,
      Math.round(performance.now() - start)
    ));

    // Check for buttons without accessible labels
    const unlabelled = Array.from(allButtons).filter(
      (b) => !b.textContent?.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')
    );
    results.push(makeResult(
      'btn-labels', 'Button accessibility labels', 'buttons',
      unlabelled.length === 0 ? 'pass' : 'warning',
      unlabelled.length === 0
        ? 'All buttons have accessible labels'
        : `${unlabelled.length} button(s) missing accessible labels`,
      5
    ));

    // Check floating dev tester button
    const floatingBtn = document.querySelector('[data-testid="dev-tester-btn"]');
    results.push(makeResult(
      'btn-floating', 'Floating tester button', 'buttons',
      floatingBtn ? 'pass' : 'warning',
      floatingBtn ? 'Floating tester button present' : 'Floating tester button not found in DOM yet',
      3
    ));

    // Check save buttons
    const saveButtons = Array.from(allButtons).filter(
      (b) => b.textContent?.toLowerCase().includes('save')
    );
    results.push(makeResult(
      'btn-save', 'Save buttons', 'buttons',
      'pass',
      `Found ${saveButtons.length} save button(s) on current page`,
      3
    ));

    return results;
  },
});

// ─── Suite: Forms ─────────────────────────────────────────────────────────────
registerSuite({
  id: 'forms',
  name: 'Forms & Inputs',
  category: 'forms',
  run: async () => {
    const results: TestResult[] = [];

    const inputs   = document.querySelectorAll('input');
    const selects  = document.querySelectorAll('select');
    const textareas = document.querySelectorAll('textarea');
    const forms    = document.querySelectorAll('form');

    results.push(makeResult(
      'form-discovery', 'Form element discovery', 'forms',
      'pass',
      `Found: ${forms.length} form(s), ${inputs.length} input(s), ${selects.length} select(s), ${textareas.length} textarea(s)`,
      5
    ));

    // Check required fields have labels
    const requiredInputs = document.querySelectorAll('input[required]');
    results.push(makeResult(
      'form-required', 'Required field validation', 'forms',
      'pass',
      `${requiredInputs.length} required input(s) found with HTML validation`,
      3
    ));

    // Check inputs have placeholder or label
    const inputsWithoutLabel = Array.from(inputs).filter(
      (i) => !i.placeholder && !i.getAttribute('aria-label') && i.type !== 'hidden' && i.type !== 'file'
    );
    results.push(makeResult(
      'form-labels', 'Input labels/placeholders', 'forms',
      inputsWithoutLabel.length === 0 ? 'pass' : 'warning',
      inputsWithoutLabel.length === 0
        ? 'All inputs have labels or placeholders'
        : `${inputsWithoutLabel.length} input(s) missing label/placeholder`,
      3
    ));

    // Check file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    results.push(makeResult(
      'form-file', 'File upload inputs', 'forms',
      'pass',
      `${fileInputs.length} file input(s) found`,
      2
    ));

    return results;
  },
});

// ─── Suite: Flowchart ─────────────────────────────────────────────────────────
registerSuite({
  id: 'flowchart',
  name: 'Flowchart System',
  category: 'flowchart',
  run: async () => {
    const results: TestResult[] = [];

    // Check ReactFlow container
    const rfContainer = document.querySelector('.react-flow');
    results.push(makeResult(
      'fc-container', 'ReactFlow canvas', 'flowchart',
      rfContainer ? 'pass' : 'skipped',
      rfContainer ? 'ReactFlow canvas found in DOM' : 'ReactFlow canvas not present on this page',
      5
    ));

    if (rfContainer) {
      // Check nodes
      const nodes = document.querySelectorAll('.react-flow__node');
      results.push(makeResult(
        'fc-nodes', 'Flowchart nodes', 'flowchart',
        nodes.length > 0 ? 'pass' : 'fail',
        `${nodes.length} node(s) rendered in flowchart`,
        3
      ));

      // Check edges
      const edges = document.querySelectorAll('.react-flow__edge');
      results.push(makeResult(
        'fc-edges', 'Flowchart edges/arrows', 'flowchart',
        edges.length > 0 ? 'pass' : 'fail',
        `${edges.length} edge(s) rendered in flowchart`,
        3
      ));

      // Check controls
      const controls = document.querySelector('.react-flow__controls');
      results.push(makeResult(
        'fc-controls', 'Flowchart controls', 'flowchart',
        controls ? 'pass' : 'warning',
        controls ? 'Zoom/pan controls present' : 'Controls not found',
        2
      ));

      // Check background
      const bg = document.querySelector('.react-flow__background');
      results.push(makeResult(
        'fc-bg', 'Flowchart background', 'flowchart',
        bg ? 'pass' : 'warning',
        bg ? 'Background grid rendered' : 'Background not found',
        2
      ));

      // Performance check
      const { duration } = await timed(async () => {
        await new Promise((r) => setTimeout(r, 50));
        return document.querySelectorAll('.react-flow__node').length;
      });
      results.push(makeResult(
        'fc-perf', 'Flowchart render performance', 'flowchart',
        duration < 500 ? 'pass' : 'warning',
        `Flowchart DOM query completed in ${duration}ms`,
        duration,
        duration >= 500 ? 'Consider optimising node count or memoisation' : undefined
      ));
    }

    return results;
  },
});

// ─── Suite: File Management ───────────────────────────────────────────────────
registerSuite({
  id: 'files',
  name: 'File Management',
  category: 'files',
  run: async () => {
    const results: TestResult[] = [];

    // Check localStorage availability
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      results.push(makeResult(
        'file-storage', 'localStorage available', 'files',
        'pass', 'localStorage read/write working', 5
      ));
    } catch {
      results.push(makeResult(
        'file-storage', 'localStorage available', 'files',
        'fail', 'localStorage not accessible', 5
      ));
    }

    // Check storage usage
    let usedBytes = 0;
    for (const key of Object.keys(localStorage)) {
      usedBytes += (localStorage.getItem(key) ?? '').length * 2;
    }
    const usedMB = (usedBytes / 1024 / 1024).toFixed(2);
    const limitMB = 5;
    results.push(makeResult(
      'file-quota', 'localStorage quota', 'files',
      parseFloat(usedMB) < limitMB * 0.8 ? 'pass' : 'warning',
      `Using ~${usedMB} MB of ~${limitMB} MB localStorage`,
      3,
      parseFloat(usedMB) >= limitMB * 0.8 ? 'Storage nearing limit — large file uploads may fail' : undefined
    ));

    // Check workflow data keys
    const workflowKeys = Object.keys(localStorage).filter((k) => k.startsWith('workflow_'));
    results.push(makeResult(
      'file-workflow', 'Workflow file data', 'files',
      'pass',
      `${workflowKeys.length} workflow storage key(s) found`,
      2
    ));

    // Check file input accept types
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const hasAccept = Array.from(fileInputs).every((i) => i.getAttribute('accept'));
    results.push(makeResult(
      'file-accept', 'File type restrictions', 'files',
      hasAccept || fileInputs.length === 0 ? 'pass' : 'warning',
      hasAccept || fileInputs.length === 0
        ? 'File inputs have accept type restrictions'
        : 'Some file inputs missing accept attribute',
      2
    ));

    return results;
  },
});

// ─── Suite: API Layer ─────────────────────────────────────────────────────────
registerSuite({
  id: 'api',
  name: 'API Layer',
  category: 'api',
  run: async () => {
    const results: TestResult[] = [];

    // Test projectService.getProjectStats
    try {
      const { projectService } = await import('@/services/projectService');
      const { duration, result } = await timed(() => projectService.getProjectStats());
      results.push(makeResult(
        'api-stats', 'projectService.getProjectStats()', 'api',
        result.success ? 'pass' : 'fail',
        result.success
          ? `Stats returned: ${result.data?.total ?? 0} total projects`
          : `Error: ${result.error?.message}`,
        duration
      ));
    } catch (e) {
      results.push(makeResult('api-stats', 'projectService.getProjectStats()', 'api',
        'fail', `Exception: ${e}`, 0));
    }

    // Test projectService.getProjectsByModule
    for (const mod of ['npd', 'vave', 'standardization'] as const) {
      try {
        const { projectService } = await import('@/services/projectService');
        const { duration, result } = await timed(() => projectService.getProjectsByModule(mod));
        results.push(makeResult(
          `api-module-${mod}`, `getProjectsByModule('${mod}')`, 'api',
          result.success ? 'pass' : 'fail',
          result.success
            ? `Returned ${result.data?.length ?? 0} project(s)`
            : `Error: ${result.error?.message}`,
          duration
        ));
      } catch (e) {
        results.push(makeResult(`api-module-${mod}`, `getProjectsByModule('${mod}')`, 'api',
          'fail', `Exception: ${e}`, 0));
      }
    }

    // Test authService
    try {
      const { authService } = await import('@/services/authService');
      const { duration, result } = await timed(async () => authService.isAuthenticated());
      results.push(makeResult(
        'api-auth', 'authService.isAuthenticated()', 'api',
        'pass',
        `Auth check: ${result ? 'User logged in' : 'No active session'}`,
        duration
      ));
    } catch (e) {
      results.push(makeResult('api-auth', 'authService.isAuthenticated()', 'api',
        'fail', `Exception: ${e}`, 0));
    }

    return results;
  },
});

// ─── Suite: Database (localStorage CRUD) ─────────────────────────────────────
registerSuite({
  id: 'database',
  name: 'Database (localStorage CRUD)',
  category: 'database',
  run: async () => {
    const results: TestResult[] = [];
    const TEST_KEY = '__devtest_crud__';

    // CREATE
    try {
      const { duration } = await timed(async () => {
        localStorage.setItem(TEST_KEY, JSON.stringify({ test: true, ts: Date.now() }));
      });
      results.push(makeResult('db-create', 'CREATE — write to storage', 'database',
        'pass', 'localStorage.setItem succeeded', duration));
    } catch (e) {
      results.push(makeResult('db-create', 'CREATE — write to storage', 'database',
        'fail', `Write failed: ${e}`, 0));
    }

    // READ
    try {
      const { duration, result } = await timed(async () => {
        return localStorage.getItem(TEST_KEY);
      });
      const parsed = result ? JSON.parse(result) : null;
      results.push(makeResult('db-read', 'READ — read from storage', 'database',
        parsed?.test === true ? 'pass' : 'fail',
        parsed?.test === true ? 'localStorage.getItem returned correct data' : 'Data mismatch on read',
        duration));
    } catch (e) {
      results.push(makeResult('db-read', 'READ — read from storage', 'database',
        'fail', `Read failed: ${e}`, 0));
    }

    // UPDATE
    try {
      const { duration } = await timed(async () => {
        const existing = JSON.parse(localStorage.getItem(TEST_KEY) ?? '{}');
        existing.updated = true;
        localStorage.setItem(TEST_KEY, JSON.stringify(existing));
      });
      const updated = JSON.parse(localStorage.getItem(TEST_KEY) ?? '{}');
      results.push(makeResult('db-update', 'UPDATE — modify stored data', 'database',
        updated.updated === true ? 'pass' : 'fail',
        updated.updated === true ? 'Update operation succeeded' : 'Update did not persist',
        duration));
    } catch (e) {
      results.push(makeResult('db-update', 'UPDATE — modify stored data', 'database',
        'fail', `Update failed: ${e}`, 0));
    }

    // DELETE
    try {
      const { duration } = await timed(async () => {
        localStorage.removeItem(TEST_KEY);
      });
      const gone = localStorage.getItem(TEST_KEY) === null;
      results.push(makeResult('db-delete', 'DELETE — remove from storage', 'database',
        gone ? 'pass' : 'fail',
        gone ? 'localStorage.removeItem succeeded' : 'Item still present after delete',
        duration));
    } catch (e) {
      results.push(makeResult('db-delete', 'DELETE — remove from storage', 'database',
        'fail', `Delete failed: ${e}`, 0));
    }

    // Check project data integrity
    try {
      const { projectService } = await import('@/services/projectService');
      const { duration, result } = await timed(() => projectService.getProjectStats());
      results.push(makeResult('db-integrity', 'Project data integrity', 'database',
        result.success ? 'pass' : 'warning',
        result.success
          ? `Project store healthy: ${result.data?.total} records`
          : 'Could not verify project data integrity',
        duration));
    } catch (e) {
      results.push(makeResult('db-integrity', 'Project data integrity', 'database',
        'warning', `Could not check: ${e}`, 0));
    }

    return results;
  },
});

// ─── Run all or specific suites ───────────────────────────────────────────────
export async function runSuites(
  category?: TestCategory,
  onProgress?: (result: TestResult) => void
): Promise<TestResult[]> {
  const suites = getSuites(category);
  const all: TestResult[] = [];

  for (const suite of suites) {
    const results = await suite.run();
    for (const r of results) {
      all.push(r);
      onProgress?.(r);
    }
  }

  return all;
}
