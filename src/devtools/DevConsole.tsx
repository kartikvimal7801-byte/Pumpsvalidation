import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bug, X, Play, ChevronDown, ChevronUp, Download,
  CheckCircle, XCircle, AlertTriangle, SkipForward,
  Trash2, FlaskConical, Clock,
} from 'lucide-react';
import { runSuites, TestResult, TestCategory, TestStatus } from './testEngine';

// ─── Only render in dev mode ──────────────────────────────────────────────────
const IS_DEV = import.meta.env.DEV;

// ─── Colour helpers ───────────────────────────────────────────────────────────
const STATUS_COLOR: Record<TestStatus, string> = {
  pass:    '#16a34a',
  fail:    '#dc2626',
  warning: '#d97706',
  skipped: '#2563eb',
};
const STATUS_BG: Record<TestStatus, string> = {
  pass:    '#f0fdf4',
  fail:    '#fef2f2',
  warning: '#fffbeb',
  skipped: '#eff6ff',
};
const STATUS_ICON: Record<TestStatus, React.ReactNode> = {
  pass:    <CheckCircle  className="h-3.5 w-3.5" style={{ color: STATUS_COLOR.pass }} />,
  fail:    <XCircle      className="h-3.5 w-3.5" style={{ color: STATUS_COLOR.fail }} />,
  warning: <AlertTriangle className="h-3.5 w-3.5" style={{ color: STATUS_COLOR.warning }} />,
  skipped: <SkipForward  className="h-3.5 w-3.5" style={{ color: STATUS_COLOR.skipped }} />,
};



// ─── Log line ─────────────────────────────────────────────────────────────────
interface LogLine {
  ts: string;
  status: TestStatus;
  text: string;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DevConsole() {
  if (!IS_DEV) return null;

  const [open, setOpen]           = useState(false);
  const [running, setRunning]     = useState(false);
  const [results, setResults]     = useState<TestResult[]>([]);
  const [logs, setLogs]           = useState<LogLine[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'logs'>('results');
  const [filter, setFilter]       = useState<TestStatus | 'all'>('all');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed]     = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // Elapsed timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Date.now() - (startTime ?? Date.now())), 100);
    return () => clearInterval(id);
  }, [running, startTime]);

  const addLog = useCallback((r: TestResult) => {
    const prefix = r.status === 'pass' ? '[PASS]' : r.status === 'fail' ? '[FAIL]' :
                   r.status === 'warning' ? '[WARN]' : '[SKIP]';
    setLogs((prev) => [...prev, {
      ts: new Date().toLocaleTimeString(),
      status: r.status,
      text: `${prefix} ${r.name} — ${r.message}`,
    }]);
  }, []);

  const runTests = useCallback(async (category?: TestCategory) => {
    setRunning(true);
    setResults([]);
    setLogs([]);
    setStartTime(Date.now());
    setActiveTab('results');

    const all: TestResult[] = [];
    await runSuites(category, (r) => {
      all.push(r);
      setResults([...all]);
      addLog(r);
    });

    setRunning(false);
    setElapsed(Date.now() - (startTime ?? Date.now()));
  }, [addLog, startTime]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const passed   = results.filter((r) => r.status === 'pass').length;
  const failed   = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  const skipped  = results.filter((r) => r.status === 'skipped').length;
  const total    = results.length;
  const rate     = total > 0 ? Math.round((passed / total) * 100) : 0;

  // ── Filtered results ───────────────────────────────────────────────────────
  const filtered = filter === 'all' ? results : results.filter((r) => r.status === filter);

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ results, logs, stats: { total, passed, failed, warnings, skipped, rate } }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dev-test-results.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportTXT = () => {
    const lines = [
      '=== Developer Testing Console Results ===',
      `Date: ${new Date().toLocaleString()}`,
      `Total: ${total} | Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings} | Skipped: ${skipped}`,
      `Success Rate: ${rate}%`,
      '',
      ...results.map((r) => `[${r.status.toUpperCase().padEnd(7)}] ${r.name}: ${r.message}`),
      '',
      '=== Logs ===',
      ...logs.map((l) => `${l.ts} ${l.text}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dev-test-results.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        data-testid="dev-tester-btn"
        onClick={() => setOpen((v) => !v)}
        title="Developer Tester"
        style={{
          position: 'fixed',
          right: open ? 524 : 16,
          bottom: 80,
          zIndex: 9999,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: open ? '#1e293b' : '#7c3aed',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          color: '#fff',
        }}
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* ── Console panel ── */}
      {open && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 520,
          background: '#0f172a',
          borderLeft: '1px solid #1e293b',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}>

          {/* Header */}
          <div style={{
            background: '#1e293b',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FlaskConical style={{ color: '#a78bfa', width: 18, height: 18 }} />
              <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>
                Developer Testing Console
              </span>
              {running && (
                <span style={{
                  fontSize: 10, color: '#fbbf24', background: '#451a03',
                  padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                }}>
                  RUNNING…
                </span>
              )}
              {!running && total > 0 && (
                <span style={{
                  fontSize: 10, color: rate >= 80 ? '#4ade80' : '#f87171',
                  background: rate >= 80 ? '#052e16' : '#450a0a',
                  padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                }}>
                  {rate}% PASS
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Action buttons */}
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            flexShrink: 0,
            background: '#0f172a',
          }}>
            {/* Full test */}
            <ActionBtn
              icon={<Play className="h-3 w-3" />}
              label="Start Full Test"
              color="#7c3aed"
              disabled={running}
              onClick={() => runTests()}
            />
            <ActionBtn
              icon={<Trash2 className="h-3 w-3" />}
              label="Clear"
              color="#374151"
              disabled={running}
              onClick={() => { setResults([]); setLogs([]); }}
            />
          </div>

          {/* Stats bar */}
          {total > 0 && (
            <div style={{
              display: 'flex',
              gap: 0,
              borderBottom: '1px solid #1e293b',
              flexShrink: 0,
            }}>
              {[
                { label: 'Total',    value: total,    color: '#94a3b8' },
                { label: 'Passed',   value: passed,   color: '#4ade80' },
                { label: 'Failed',   value: failed,   color: '#f87171' },
                { label: 'Warnings', value: warnings, color: '#fbbf24' },
                { label: 'Skipped',  value: skipped,  color: '#60a5fa' },
              ].map((s) => (
                <div key={s.label} style={{
                  flex: 1, padding: '6px 4px', textAlign: 'center',
                  borderRight: '1px solid #1e293b',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
              <div style={{ flex: 1, padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: rate >= 80 ? '#4ade80' : '#f87171' }}>{rate}%</div>
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase' }}>Rate</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #1e293b',
            flexShrink: 0,
          }}>
            {(['results', 'logs'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  flex: 1, padding: '8px', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeTab === t ? '#a78bfa' : '#475569',
                  borderBottom: activeTab === t ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'results' ? `Results (${total})` : `Logs (${logs.length})`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Results tab */}
            {activeTab === 'results' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {total === 0 && !running && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569' }}>
                    <FlaskConical style={{ width: 32, height: 32, margin: '0 auto 8px', opacity: 0.4 }} />
                    <p style={{ fontSize: 12 }}>Click "Start Full Test" to begin</p>
                  </div>
                )}

                {/* Filter pills */}
                {total > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                    {(['all', 'pass', 'fail', 'warning', 'skipped'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 999,
                          border: `1px solid ${f === 'all' ? '#334155' : STATUS_COLOR[f as TestStatus] ?? '#334155'}`,
                          background: filter === f ? (f === 'all' ? '#334155' : STATUS_BG[f as TestStatus]) : 'transparent',
                          color: f === 'all' ? '#94a3b8' : STATUS_COLOR[f as TestStatus] ?? '#94a3b8',
                          cursor: 'pointer', fontWeight: 700,
                        }}
                      >
                        {f === 'all' ? `All (${total})` :
                         f === 'pass' ? `✓ ${passed}` :
                         f === 'fail' ? `✗ ${failed}` :
                         f === 'warning' ? `⚠ ${warnings}` : `↷ ${skipped}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Result rows */}
                {filtered.map((r) => (
                  <ResultRow key={r.id} result={r} />
                ))}
              </div>
            )}

            {/* Logs tab */}
            {activeTab === 'logs' && (
              <div
                ref={logRef}
                style={{
                  flex: 1, overflowY: 'auto', padding: '8px',
                  fontFamily: 'monospace', fontSize: 11,
                }}
              >
                {logs.length === 0 && (
                  <div style={{ color: '#475569', textAlign: 'center', padding: 20 }}>
                    No logs yet. Run a test to see output.
                  </div>
                )}
                {logs.map((l, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 8, padding: '2px 0',
                    borderBottom: '1px solid #0f172a',
                  }}>
                    <span style={{ color: '#475569', flexShrink: 0 }}>{l.ts}</span>
                    <span style={{ color: STATUS_COLOR[l.status] }}>{l.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer — export + timing */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: '#0f172a',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <ExportBtn label="JSON" onClick={exportJSON} disabled={total === 0} />
              <ExportBtn label="TXT"  onClick={exportTXT}  disabled={total === 0} />
            </div>
            {(running || total > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontSize: 10 }}>
                <Clock style={{ width: 10, height: 10 }} />
                {running ? `${(elapsed / 1000).toFixed(1)}s` : `${(elapsed / 1000).toFixed(1)}s total`}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBtn({ icon, label, color, disabled, onClick }: {
  icon: React.ReactNode; label: string; color: string;
  disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
        background: disabled ? '#1e293b' : color,
        color: disabled ? '#475569' : '#fff',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}{label}
    </button>
  );
}

function ExportBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 3,
        padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
        background: disabled ? '#1e293b' : '#1e293b',
        color: disabled ? '#334155' : '#94a3b8',
        border: '1px solid #334155', cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <Download style={{ width: 10, height: 10 }} />
      {label}
    </button>
  );
}

function ResultRow({ result }: { result: TestResult }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      marginBottom: 3, borderRadius: 6, overflow: 'hidden',
      border: `1px solid ${STATUS_COLOR[result.status]}33`,
      background: STATUS_BG[result.status] + '18',
    }}>
      <div
        onClick={() => result.detail && setExpanded((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 8px',
          cursor: result.detail ? 'pointer' : 'default',
        }}
      >
        {STATUS_ICON[result.status]}
        <span style={{ flex: 1, fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>
          {result.name}
        </span>
        <span style={{ fontSize: 10, color: '#64748b' }}>{result.duration}ms</span>
        {result.detail && (
          expanded
            ? <ChevronUp style={{ width: 10, height: 10, color: '#64748b' }} />
            : <ChevronDown style={{ width: 10, height: 10, color: '#64748b' }} />
        )}
      </div>
      <div style={{ padding: '0 8px 5px 28px', fontSize: 10, color: '#94a3b8' }}>
        {result.message}
      </div>
      {expanded && result.detail && (
        <div style={{
          padding: '4px 8px 6px 28px', fontSize: 10,
          color: STATUS_COLOR[result.status],
          background: STATUS_BG[result.status] + '40',
          borderTop: `1px solid ${STATUS_COLOR[result.status]}22`,
        }}>
          ⚠ {result.detail}
        </div>
      )}
    </div>
  );
}
