'use client';

import React, { useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  NodeTypes,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import AgentDetailPanel from './AgentDetailPanel';
import type { Agent } from '@/types/agent';
import { WORKSPACE_NAMES } from '@/lib/constants';

/* ── status helpers ── */
const statusColor: Record<string, string> = {
  active: '#22c55e',
  paused: '#eab308',
  error: '#ef4444',
  draft: '#6b7280',
};

/* ── static agent data ── */
const STATIC_AGENTS: (Agent & { department: string })[] = [
  { id: 'a1', name: 'Facebook Agent', family: 'Marketing', status: 'active', role: 'facebook_poster', department: 'Marketing', workspaceId: 2 },
  { id: 'a2', name: 'Instagram Agent', family: 'Marketing', status: 'active', role: 'instagram_poster', department: 'Marketing', workspaceId: 2 },
  { id: 'a3', name: 'Blog Writer Agent', family: 'Marketing', status: 'paused', role: 'blog_writer', department: 'Marketing', workspaceId: 2 },
  { id: 'a4', name: 'Inbound Caller Agent', family: 'Sales', status: 'active', role: 'inbound_caller', department: 'Sales', workspaceId: 2 },
  { id: 'a5', name: 'Lead Qualifier Agent', family: 'Sales', status: 'active', role: 'lead_qualifier', department: 'Sales', workspaceId: 2 },
  { id: 'a6', name: 'CRM Manager Agent', family: 'Operations', status: 'active', role: 'crm_manager', department: 'Operations', workspaceId: 2 },
  { id: 'a7', name: 'Email Writer Agent', family: 'Operations', status: 'error', role: 'email_writer', department: 'Operations', workspaceId: 2 },
];

/* ── Workspace Node ── */
function WorkspaceNode({ data }: NodeProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
        border: '2px solid #3b82f6',
        borderRadius: 12,
        padding: '14px 32px',
        color: '#fff',
        fontWeight: 700,
        fontSize: 16,
        textAlign: 'center',
        minWidth: 180,
        boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
      }}
    >
      {data.label}
      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6' }} />
    </div>
  );
}

/* ── Department Node ── */
function DepartmentNode({ data }: NodeProps) {
  return (
    <div
      style={{
        background: '#1e293b',
        border: '1.5px solid #475569',
        borderRadius: 10,
        padding: '10px 24px',
        color: '#e2e8f0',
        fontWeight: 600,
        fontSize: 14,
        textAlign: 'center',
        minWidth: 150,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#475569' }} />
      <div>{data.label}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
        {data.agentCount} agent{data.agentCount !== 1 ? 's' : ''}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#475569' }} />
    </div>
  );
}

/* ── Agent Node ── */
interface AgentNodeData {
  label: string;
  status: string;
  agent: Agent;
  onClickAgent?: () => void;
}

function AgentNode({ data }: NodeProps<AgentNodeData>) {
  const color = statusColor[data.status] || '#6b7280';
  return (
    <div
      onClick={() => data.onClickAgent?.()}
      style={{
        background: '#0f172a',
        border: `1.5px solid ${color}`,
        borderRadius: 8,
        padding: '10px 16px',
        color: '#e2e8f0',
        fontSize: 13,
        minWidth: 130,
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600 }}>{data.label}</span>
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, textTransform: 'capitalize' }}>
        {data.status}
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  workspaceNode: WorkspaceNode,
  departmentNode: DepartmentNode,
  agentNode: AgentNode,
};

/* ── edge style ── */
const edgeStyle = { stroke: '#4B5563', strokeWidth: 1.5 };

/* ── Main Component ── */
export default function AgentOrgChart({ workspaceId }: { workspaceId: number }) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];

    /* Workspace root */
    result.push({
      id: 'ws-solis',
      type: 'workspaceNode',
      position: { x: 600, y: 0 },
      data: { label: WORKSPACE_NAMES[workspaceId] || 'Unknown Workspace' },
      draggable: true,
    });

    /* Departments */
    result.push({
      id: 'dept-marketing',
      type: 'departmentNode',
      position: { x: 200, y: 150 },
      data: { label: 'Marketing', agentCount: 3 },
      draggable: true,
    });
    result.push({
      id: 'dept-sales',
      type: 'departmentNode',
      position: { x: 600, y: 150 },
      data: { label: 'Sales', agentCount: 2 },
      draggable: true,
    });
    result.push({
      id: 'dept-operations',
      type: 'departmentNode',
      position: { x: 1000, y: 150 },
      data: { label: 'Operations', agentCount: 2 },
      draggable: true,
    });

    /* Agent positions by department */
    const positions: Record<string, number[]> = {
      Marketing: [80, 220, 360],
      Sales: [480, 720],
      Operations: [880, 1120],
    };
    const deptIndex: Record<string, number> = { Marketing: 0, Sales: 0, Operations: 0 };

    STATIC_AGENTS.forEach((agent) => {
      const dept = agent.department;
      const xArr = positions[dept];
      const idx = deptIndex[dept];
      const x = xArr[idx];
      deptIndex[dept] = idx + 1;

      result.push({
        id: agent.id,
        type: 'agentNode',
        position: { x, y: 320 },
        data: {
          label: agent.name,
          status: agent.status,
          agent,
          onClickAgent: () => setSelectedAgent(agent),
        },
        draggable: false,
      });
    });

    return result;
  }, [workspaceId]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    const deptIds = ['dept-marketing', 'dept-sales', 'dept-operations'];

    /* workspace → departments */
    deptIds.forEach((dId) => {
      result.push({
        id: `ws-solis->${dId}`,
        source: 'ws-solis',
        target: dId,
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      });
    });

    /* departments → agents */
    const deptMap: Record<string, string> = {
      Marketing: 'dept-marketing',
      Sales: 'dept-sales',
      Operations: 'dept-operations',
    };

    STATIC_AGENTS.forEach((agent) => {
      const parentId = deptMap[agent.department];
      result.push({
        id: `${parentId}->${agent.id}`,
        source: parentId,
        target: agent.id,
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      });
    });

    return result;
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        fitView={false}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      />
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
