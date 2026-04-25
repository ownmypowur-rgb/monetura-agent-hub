'use client';

import React, { useState } from 'react';
import { useTasks, TaskData } from '@/lib/hooks/useTasks';
import { StatusBadge, timeAgo } from '@/components/TaskHistory';
import TestingBanner from '@/components/TestingBanner';
import { Search, Filter } from 'lucide-react';

export default function ActivityPage() {
  const { tasks, loading, refetch } = useTasks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);

  const filtered = tasks.filter((t) => {
    const matchesSearch = !search || t.brief.toLowerCase().includes(search.toLowerCase()) || t.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-zinc-500 text-sm mt-1">All tasks across every project</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500" />
          {['all', 'queued', 'running', 'complete', 'testing', 'passed', 'failed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No tasks found</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filtered.map((task) => (
                <button key={task.id} onClick={() => setSelectedTask(task)} className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors ${selectedTask?.id === task.id ? 'bg-zinc-800/70' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{task.projectName}</span>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="text-sm text-zinc-200 truncate">{task.brief.split('\n')[0]}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(task.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          {selectedTask ? (
            <>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">Task Details</h3>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <div><p className="text-xs text-zinc-500">Project</p><p className="text-sm text-zinc-300">{selectedTask.projectName}</p></div>
                <div><p className="text-xs text-zinc-500">Brief</p><p className="text-sm text-zinc-300 whitespace-pre-wrap">{selectedTask.brief}</p></div>
                <div><p className="text-xs text-zinc-500">Created</p><p className="text-sm text-zinc-300">{new Date(selectedTask.createdAt).toLocaleString()}</p></div>
                {selectedTask.completedAt && <div><p className="text-xs text-zinc-500">Completed</p><p className="text-sm text-zinc-300">{new Date(selectedTask.completedAt).toLocaleString()}</p></div>}
                {selectedTask.deploymentUrl && <div><p className="text-xs text-zinc-500">Deployment</p><a href={selectedTask.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{selectedTask.deploymentUrl}</a></div>}
                {selectedTask.logs && (
                  <div><p className="text-xs text-zinc-500 mb-1">Logs</p><pre className="text-xs text-zinc-400 bg-black/50 rounded p-2 max-h-60 overflow-auto font-mono whitespace-pre-wrap">{selectedTask.logs}</pre></div>
                )}
              </div>
              <TestingBanner task={selectedTask} onFeedbackSubmitted={() => { refetch(); setSelectedTask(null); }} />
            </>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500 text-sm">Select a task to see details</div>
          )}
        </div>
      </div>
    </div>
  );
}
