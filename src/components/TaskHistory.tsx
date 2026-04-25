'use client';

import React, { useState } from 'react';
import { useTasks, TaskData } from '@/lib/hooks/useTasks';
import { Clock, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight, FlaskConical } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  queued: { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-zinc-400 bg-zinc-400/10', label: 'Queued' },
  running: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: 'text-blue-400 bg-blue-400/10', label: 'Running' },
  complete: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-amber-400 bg-amber-400/10', label: 'Complete' },
  testing: { icon: <FlaskConical className="w-3.5 h-3.5" />, color: 'text-purple-400 bg-purple-400/10', label: 'Testing' },
  passed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-emerald-400 bg-emerald-400/10', label: 'Passed' },
  failed: { icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-400 bg-red-400/10', label: 'Failed' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.queued;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function TaskRow({ task }: { task: TaskData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-zinc-800 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/50 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 truncate">{task.brief.split('\n')[0]}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{timeAgo(task.createdAt)}</p>
        </div>
        <StatusBadge status={task.status} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 pl-10">
          <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-1">Brief</p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{task.brief}</p>
            </div>
            {task.deploymentUrl && (
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1">Deployment</p>
                <a href={task.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{task.deploymentUrl}</a>
              </div>
            )}
            {task.testNotes && (
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1">Test Notes</p>
                <p className="text-sm text-zinc-300">{task.testNotes}</p>
              </div>
            )}
            {task.errorMessage && (
              <div>
                <p className="text-xs font-medium text-red-400 mb-1">Error</p>
                <p className="text-sm text-red-300">{task.errorMessage}</p>
              </div>
            )}
            {task.logs && (
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1">Logs</p>
                <pre className="text-xs text-zinc-400 bg-black/50 rounded p-2 max-h-48 overflow-auto font-mono whitespace-pre-wrap">{task.logs}</pre>
              </div>
            )}
            {task.parentTaskId && (
              <p className="text-xs text-zinc-500">Follow-up fix for task: <span className="text-zinc-400 font-mono">{task.parentTaskId.slice(0, 8)}...</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaskHistory({ projectId }: { projectId: string }) {
  const { tasks, loading } = useTasks(projectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return <div className="text-center py-6 text-zinc-500 text-sm">No tasks yet for this project</div>;
  }

  return (
    <div className="divide-y divide-zinc-800">
      {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
    </div>
  );
}
