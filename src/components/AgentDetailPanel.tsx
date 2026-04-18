"use client";
import { X } from "lucide-react";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "text-green-400",
  paused: "text-yellow-400",
  error: "text-red-400",
  idle: "text-gray-400",
};

interface AgentDetailPanelProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-gray-900 border border-gray-700 rounded-xl p-5 z-50 overflow-auto shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold text-base">{agent.name}</h2>
          <p className="text-gray-400 text-xs mt-0.5">{agent.family}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Status</span>
          <span className={cn("font-medium capitalize", statusColors[agent.status] ?? "text-gray-400")}>
            {agent.status}
          </span>
        </div>
        {agent.description && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Description</p>
            <p className="text-gray-300 text-sm">{agent.description}</p>
          </div>
        )}
        {agent.lastRun && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Run</span>
            <span className="text-gray-300">{agent.lastRun}</span>
          </div>
        )}
        {agent.triggersCount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Triggers</span>
            <span className="text-gray-300">{agent.triggersCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
