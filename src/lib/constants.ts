export const WORKSPACES = {
  MONETURA: 1,
  SOLIS_ENERGY: 2,
  QUOTEPATH: 3,
} as const;

export const WORKSPACE_NAMES: Record<number, string> = {
  1: "Monetura Media",
  2: "Solis Energy",
  3: "QuotePath",
};

export const AGENT_FAMILIES = [
  "Lead Generation",
  "Follow-up",
  "Onboarding",
  "Analytics",
  "Support",
] as const;

export const AGENT_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
  ERROR: "error",
  IDLE: "idle",
} as const;

export type AgentStatus = (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS];
