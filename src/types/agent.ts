import type { AgentStatus } from "@/lib/constants";

export interface Agent {
  id: string;
  name: string;
  family: string;
  status: AgentStatus;
  workspaceId: number;
  description?: string;
  lastRun?: string;
  triggersCount?: number;
  parentId?: string | null;
}

export interface AgentFamilyGroup {
  family: string;
  agents: Agent[];
}

export interface OrgChartNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Agent & { label: string };
}
