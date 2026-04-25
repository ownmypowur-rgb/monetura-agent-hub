'use client';

import dynamic from 'next/dynamic';
import GlobalTaskFeed from '@/components/GlobalTaskFeed';
import { useWorkspace } from '@/lib/workspace-context';

const AgentOrgChart = dynamic(() => import('@/components/AgentOrgChart'), { ssr: false });

export default function HubPage() {
  const activeWorkspace = useWorkspace();

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Agent Hub Dashboard</h1>
        <p className="text-zinc-500 text-sm">Manage all Monetura AI agents across workspaces</p>
      </div>
      <GlobalTaskFeed />
      <div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-4">Agent Organization</h2>
        <AgentOrgChart workspaceId={activeWorkspace} />
      </div>
    </div>
  );
}
