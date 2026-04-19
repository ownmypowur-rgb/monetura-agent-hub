'use client';
import { useState } from 'react';
import AgentDetailPanel from './AgentDetailPanel';

const STATIC_AGENTS = [
  { id: 'a1', name: 'Facebook Agent', status: 'active', role: 'facebook_poster', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Posts to Facebook', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 142, successRate: 98 },
  { id: 'a2', name: 'Instagram Agent', status: 'active', role: 'instagram_poster', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Posts to Instagram', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 89, successRate: 95 },
  { id: 'a3', name: 'Blog Writer Agent', status: 'paused', role: 'blog_writer', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Writes blog posts', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 34, successRate: 91 },
  { id: 'a4', name: 'Inbound Caller Agent', status: 'active', role: 'inbound_caller', family: 'sales', department: 'Sales', workspaceId: 2, model: 'vapi', description: 'Handles inbound calls', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 521, successRate: 94 },
  { id: 'a5', name: 'Lead Qualifier Agent', status: 'active', role: 'lead_qualifier', family: 'sales', department: 'Sales', workspaceId: 2, model: 'claude', description: 'Qualifies leads', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 1204, successRate: 97 },
  { id: 'a6', name: 'CRM Manager Agent', status: 'active', role: 'crm_manager', family: 'operations', department: 'Operations', workspaceId: 2, model: 'claude', description: 'Manages CRM data', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 892, successRate: 99 },
  { id: 'a7', name: 'Email Writer Agent', status: 'error', role: 'email_writer', family: 'operations', department: 'Operations', workspaceId: 2, model: 'claude', description: 'Writes emails', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'failure', executionCount: 203, successRate: 87 },
];

const statusColor: Record<string, string> = {
  active: '#22c55e',
  paused: '#eab308',
  error: '#ef4444',
  inactive: '#6b7280',
};

const DEPARTMENTS = ['Marketing', 'Sales', 'Operations'];

export default function AgentOrgChart({ workspaceId }: { workspaceId: number }) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 40,
    }}>

      {/* Workspace Root */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)',
        border: '2px solid #3b82f6',
        borderRadius: 12,
        padding: '14px 48px',
        color: '#fff',
        fontWeight: 700,
        fontSize: 18,
        boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
      }}>
        Solis Energy
      </div>

      {/* Departments Row */}
      <div style={{
        display: 'flex',
        gap: 60,
        alignItems: 'flex-start',
        width: '100%',
        justifyContent: 'center',
      }}>
        {DEPARTMENTS.map(dept => {
          const deptAgents = STATIC_AGENTS.filter(a => a.department === dept);
          return (
            <div key={dept} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}>
              {/* Department Box */}
              <div style={{
                background: '#1e293b',
                border: '1.5px solid #475569',
                borderRadius: 10,
                padding: '10px 24px',
                color: '#e2e8f0',
                fontWeight: 600,
                fontSize: 14,
                textAlign: 'center',
                minWidth: 150,
              }}>
                <div>{dept}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {deptAgents.length} agents
                </div>
              </div>

              {/* Agent Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {deptAgents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    style={{
                      background: '#0f172a',
                      border: `1.5px solid ${statusColor[agent.status] || '#6b7280'}`,
                      borderRadius: 8,
                      padding: '10px 16px',
                      color: '#e2e8f0',
                      fontSize: 13,
                      minWidth: 160,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: statusColor[agent.status] || '#6b7280',
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontWeight: 600 }}>{agent.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, textTransform: 'capitalize' }}>
                      {agent.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
