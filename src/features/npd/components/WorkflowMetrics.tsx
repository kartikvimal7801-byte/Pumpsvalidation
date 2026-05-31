import { CheckCircle, Clock, XCircle, BarChart2 } from 'lucide-react';
import { WorkflowMetrics as Metrics } from '@/services/workflowService';

interface WorkflowMetricsProps {
  metrics: Metrics;
  lastSaved: string;
}

export default function WorkflowMetrics({ metrics, lastSaved }: WorkflowMetricsProps) {
  const lastSavedLabel = lastSaved
    ? new Date(lastSaved).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <BarChart2 className="h-4 w-4 text-[#1a7a8a] flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Progress</span>
              <span className="text-[10px] font-bold text-[#1a7a8a]">{metrics.progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a7a8a] rounded-full transition-all duration-500"
                style={{ width: `${metrics.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

        {/* Completed */}
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-[10px] text-gray-400 leading-none">Completed</p>
            <p className="text-sm font-bold text-gray-800 leading-tight">{metrics.completed}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-blue-400" />
          <div>
            <p className="text-[10px] text-gray-400 leading-none">Pending</p>
            <p className="text-sm font-bold text-gray-800 leading-tight">{metrics.pending}</p>
          </div>
        </div>

        {/* Failed */}
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-400" />
          <div>
            <p className="text-[10px] text-gray-400 leading-none">Failed</p>
            <p className="text-sm font-bold text-gray-800 leading-tight">{metrics.failed}</p>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

        {/* Compliance */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 relative flex-shrink-0">
            <svg viewBox="0 0 32 32" className="w-8 h-8 -rotate-90">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="16" cy="16" r="12" fill="none"
                stroke={metrics.compliancePercent >= 80 ? '#22c55e' : metrics.compliancePercent >= 50 ? '#f97316' : '#ef4444'}
                strokeWidth="4"
                strokeDasharray={`${(metrics.compliancePercent / 100) * 75.4} 75.4`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-gray-700">
              {metrics.compliancePercent}%
            </span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 leading-none">Compliance</p>
            <p className="text-xs font-semibold text-gray-700 leading-tight">Criteria</p>
          </div>
        </div>

        <div className="ml-auto text-[10px] text-gray-400 flex-shrink-0">
          Saved {lastSavedLabel}
        </div>
      </div>
    </div>
  );
}
