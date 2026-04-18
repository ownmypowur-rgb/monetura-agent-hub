"use client";
import { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import AgentDetailPanel from "./AgentDetailPanel";
import type { Agent } from "@/types/agent";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  error: "bg-red-500",
  idle: "bg-gray-500",
};

function AgentNodeInner({ data }: { data: Agent & { label: string; onClick?: (a: Agent) => void } }) {
  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 min-w-[180px] cursor-pointer hover:border-blue-500 transition-colors"
      onClick={() => data.onClick?.(data)}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`h-2 w-2 rounded-full ${statusColors[data.status] ?? "bg-gray-500"}`} />
        <span className="text-white text-sm font-medium truncate">{data.name}</span>
      </div>
      <p className="text-gray-400 text-xs truncate">{data.family}</p>
    </div>
  );
}

const nodeTypes = { agentNode: AgentNodeInner };

const STATIC_AGENTS: Agent[] = [
  { id: "1", name: "Lead Capture Bot", family: "Lead Generation", status: "active", workspaceId: 2, description: "Captures leads from web forms and qualifying questions.", lastRun: "2 min ago", triggersCount: 142 },
  { id: "2", name: "Follow-up Sequence", family: "Follow-up", status: "active", workspaceId: 2, parentId: "1", description: "Sends timed follow-up emails and SMS after lead capture.", lastRun: "5 min ago", triggersCount: 89 },
  { id: "3", name: "Solar Advisor", family: "Onboarding", status: "active", workspaceId: 2, parentId: "1", description: "Guides prospects through solar assessment flow.", lastRun: "12 min ago", triggersCount: 34 },
  { id: "4", name: "Bill Analyzer", family: "Analytics", status: "paused", workspaceId: 2, parentId: "3", description: "Extracts and analyzes utility bill data for solar proposals.", lastRun: "1 hr ago", triggersCount: 18 },
  { id: "5", name: "Review Requester", family: "Follow-up", status: "active", workspaceId: 2, parentId: "2", description: "Requests Google reviews from completed installations.", lastRun: "30 min ago", triggersCount: 7 },
  { id: "6", name: "Error Reporter", family: "Support", status: "error", workspaceId: 2, description: "Monitors agent errors and notifies the team.", lastRun: "3 hr ago", triggersCount: 2 },
  { id: "7", name: "Onboard Scheduler", family: "Onboarding", status: "active", workspaceId: 2, parentId: "3", description: "Books onboarding calls with new Solis customers.", lastRun: "45 min ago", triggersCount: 11 },
];

function buildNodesAndEdges(agents: Agent[], onClick: (a: Agent) => void): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const roots = agents.filter((a) => !a.parentId);
  const childrenMap: Record<string, Agent[]> = {};
  agents.filter((a) => a.parentId).forEach((a) => {
    if (!childrenMap[a.parentId!]) childrenMap[a.parentId!] = [];
    childrenMap[a.parentId!].push(a);
  });

  roots.forEach((agent, i) => {
    nodes.push({ id: agent.id, type: "agentNode", position: { x: i * 240, y: 0 }, data: { ...agent, label: agent.name, onClick } });
  });

  let currentLevel = roots;
  let level = 1;
  while (currentLevel.length > 0) {
    const nextLevel: Agent[] = [];
    currentLevel.forEach((parent) => {
      const kids = childrenMap[parent.id] ?? [];
      kids.forEach((child, j) => {
        nodes.push({ id: child.id, type: "agentNode", position: { x: j * 240, y: level * 160 }, data: { ...child, label: child.name, onClick } });
        edges.push({ id: `e-${parent.id}-${child.id}`, source: parent.id, target: child.id, style: { stroke: "#4b5563" } });
        nextLevel.push(child);
      });
    });
    currentLevel = nextLevel;
    level++;
  }

  return { nodes, edges };
}

export default function AgentOrgChart() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const handleClick = useCallback((agent: Agent) => setSelectedAgent(agent), []);
  const { nodes, edges } = buildNodesAndEdges(STATIC_AGENTS, handleClick);

  return (
    <div className="relative w-full h-full">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
        <Background variant={BackgroundVariant.Dots} gap={20} color="#374151" />
        <Controls />
      </ReactFlow>
      {selectedAgent && <AgentDetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
    </div>
  );
}
