// Agent Hub — Monetura Media
"use client";
import dynamic from "next/dynamic";
import { useWorkspace } from "@/lib/workspace-context";
const AgentOrgChart = dynamic(() => import("@/components/AgentOrgChart"), { ssr: false });
export default function HubPage() {
  const activeWorkspace = useWorkspace();
  const stats = [{ label: "Active", count: 5, color: "bg-green-500" }, { label: "Paused", count: 1, color: "bg-yellow-500" }, { label: "Errors", count: 1, color: "bg-red-500" }];
  return (<div className="flex flex-col h-full p-6"><div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold text-white">Agent Hub</h1><div className="flex items-center gap-4">{stats.map((s) => (<div key={s.label} className="flex items-center gap-2 text-sm"><span className={`h-2 w-2 rounded-full ${s.color}`} /><span className="text-gray-400">{s.count} {s.label}</span></div>))}</div></div><div className="flex-1 rounded-xl border border-gray-800 overflow-hidden"><AgentOrgChart workspaceId={activeWorkspace} /></div></div>);
}
