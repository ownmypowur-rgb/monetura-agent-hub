'use client';

import React from 'react';
import { useGlobalStats, useTasks, TaskData } from '@/lib/hooks/useTasks';
import { StatusBadge, timeAgo } from './TaskHistory';
import { Activity, XCircle, Zap, FolderOpen, TrendingUp, Loader2 } from 'lucide-react';

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

export default function GlobalTaskFeed() {
  const { stats, loading: statsLoading } = useGlobalStats();
  const { tasks, loading: tasksLoading } = useTasks();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Zap className="w-5 h-5 text-amber-400" />} label="Tasks Today" value={statsLoading ? '...' : stats?.tasksToday ?? 0} color="bg-amber-400/10" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} label="Pass Rate" value={statsLoading ? '...' : `${stats?.passRate ?? 100}%`} color="bg-emerald-400/10" />
        <StatCard icon={<FolderOpen className="w-5 h-5 text-blue-400" />} label="Active Projects" value={statsLoading ? '...' : stats?.activeProjects ?? 0} color="bg-blue-400/10" />
        <StatCard icon={<XCircle className="w-5 h-5 text-red-400" />} label="Failed Today" value={statsLoading ? '...' : stats?.failedToday ?? 0} color="bg-red-400/10" />
      </div>
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <Activity className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Recent Activity</h3>
        </div>
        {tasksLoading ? (
          <div className="flex items-center justify-center py-8 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">No tasks yet. Run your first task to see activity here.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {tasks.slice(0, 15).map((task: TaskData) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{task.projectName}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-zinc-300 truncate mt-1">{task.brief.split('\n')[0]}</p>
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap">{timeAgo(task.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
