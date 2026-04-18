"use client";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  error: "bg-red-500",
  idle: "bg-gray-500",
};

interface AgentNodeProps {
  data: Agent & { label: string; onClick?: (agent: Agent) => void };
}

export default function AgentNode({ data }: AgentNodeProps) {
  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 min-w-[180px] cursor-pointer hover:border-blue-500 transition-colors"
      onClick={() => data.onClick?.(data)}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={cn("h-2 w-2 rounded-full", statusColors[data.status] ?? "bg-gray-500")} />
        <span className="text-white text-sm font-medium truncate">{data.name}</span>
      </div>
      <p className="text-gray-400 text-xs truncate">{data.family}</p>
    </div>
  );
}
