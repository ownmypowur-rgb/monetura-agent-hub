'use client';
import { useState } from 'react';
import AgentDetailPanel from './AgentDetailPanel';

const SOLIS_AGENTS = [
  { id: 'a1', name: 'Facebook Agent', status: 'active', role: 'facebook_poster', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Posts to Facebook', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 142, successRate: 98 },
  { id: 'a2', name: 'Instagram Agent', status: 'active', role: 'instagram_poster', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Posts to Instagram', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 89, successRate: 95 },
  { id: 'a3', name: 'Blog Writer Agent', status: 'paused', role: 'blog_writer', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Writes blog posts', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 34, successRate: 91 },
  { id: 'solis-seo-strat', name: 'SEO Strategist', status: 'inactive', role: 'seo_strategist', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Plans and executes SEO strategy, keyword research, content gaps, and ranking improvements for solisenergy.ca', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'solis-meta-ads', name: 'Meta Ads Manager', status: 'inactive', role: 'meta_ads_manager', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Manages Facebook and Instagram ad campaigns, budget optimization, and lead generation for Solis Energy', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'solis-platform-ads', name: 'Platform Ads Manager', status: 'inactive', role: 'platform_ads_manager', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Manages Google Ads, YouTube, and other platform advertising for Solis Energy', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'solis-seo-web', name: 'SEO & Website Manager', status: 'inactive', role: 'seo_content', family: 'marketing', department: 'Marketing', workspaceId: 2, model: 'claude', description: 'Monitors site health, indexing, broken links, and content updates for solisenergy.ca', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'a4', name: 'Inbound Caller Agent', status: 'active', role: 'inbound_caller', family: 'sales', department: 'Sales', workspaceId: 2, model: 'vapi', description: 'Handles inbound calls', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 521, successRate: 94 },
  { id: 'a5', name: 'Lead Qualifier Agent', status: 'active', role: 'lead_qualifier', family: 'sales', department: 'Sales', workspaceId: 2, model: 'claude', description: 'Qualifies leads', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 1204, successRate: 97 },
  { id: 'a6', name: 'CRM Manager Agent', status: 'active', role: 'crm_manager', family: 'operations', department: 'Operations', workspaceId: 2, model: 'claude', description: 'Manages CRM data', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 892, successRate: 99 },
  { id: 'a7', name: 'Email Writer Agent', status: 'error', role: 'email_writer', family: 'operations', department: 'Operations', workspaceId: 2, model: 'claude', description: 'Writes emails', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'failure', executionCount: 203, successRate: 87 },
];

const QUOTEPATH_AGENTS = [
  { id: 'qp-fb', name: 'Facebook Agent', status: 'active', role: 'facebook_poster', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Posts to Facebook for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 67, successRate: 96 },
  { id: 'qp-ig', name: 'Instagram Agent', status: 'active', role: 'instagram_poster', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Posts to Instagram for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 45, successRate: 93 },
  { id: 'qp-blog', name: 'Blog Writer Agent', status: 'paused', role: 'blog_writer', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Writes blog posts for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 12, successRate: 90 },
  { id: 'qp-seo-strat', name: 'SEO Strategist', status: 'inactive', role: 'seo_strategist', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Plans and executes SEO strategy, keyword research, content gaps, and ranking improvements for quotepath.ca', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'qp-meta-ads', name: 'Meta Ads Manager', status: 'inactive', role: 'meta_ads_manager', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Manages Facebook and Instagram ad campaigns, budget optimization, and lead generation for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'qp-platform-ads', name: 'Platform Ads Manager', status: 'inactive', role: 'platform_ads_manager', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Manages Google Ads, YouTube, and other platform advertising for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'qp-seo-web', name: 'SEO & Website Manager', status: 'inactive', role: 'seo_content', family: 'marketing', department: 'Marketing', workspaceId: 3, model: 'claude', description: 'Monitors site health, indexing, broken links, and content updates for quotepath.ca', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'qp-inbound', name: 'Inbound Caller Agent', status: 'active', role: 'inbound_caller', family: 'sales', department: 'Sales', workspaceId: 3, model: 'vapi', description: 'Handles inbound calls for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 310, successRate: 92 },
  { id: 'qp-lead', name: 'Lead Qualifier Agent', status: 'active', role: 'lead_qualifier', family: 'sales', department: 'Sales', workspaceId: 3, model: 'claude', description: 'Qualifies leads for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 780, successRate: 95 },
  { id: 'qp-crm', name: 'CRM Manager Agent', status: 'active', role: 'crm_manager', family: 'operations', department: 'Operations', workspaceId: 3, model: 'claude', description: 'Manages CRM data for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 540, successRate: 98 },
  { id: 'qp-email', name: 'Email Writer Agent', status: 'active', role: 'email_writer', family: 'operations', department: 'Operations', workspaceId: 3, model: 'claude', description: 'Writes emails for QuotePath', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 150, successRate: 91 },
];

const MONETURA_AGENTS = [
  { id: 'mon-fb', name: 'Facebook Agent', status: 'active', role: 'facebook_poster', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Posts to Facebook for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 98, successRate: 97 },
  { id: 'mon-ig', name: 'Instagram Agent', status: 'active', role: 'instagram_poster', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Posts to Instagram for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 72, successRate: 94 },
  { id: 'mon-blog', name: 'Blog Writer Agent', status: 'paused', role: 'blog_writer', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Writes blog posts for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 20, successRate: 89 },
  { id: 'mon-seo-strat', name: 'SEO Strategist', status: 'inactive', role: 'seo_strategist', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Plans and executes SEO strategy, keyword research, content gaps, and ranking improvements for moneturamedia.com', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'mon-meta-ads', name: 'Meta Ads Manager', status: 'inactive', role: 'meta_ads_manager', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Manages Facebook and Instagram ad campaigns, budget optimization, and lead generation for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'mon-platform-ads', name: 'Platform Ads Manager', status: 'inactive', role: 'platform_ads_manager', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Manages Google Ads, YouTube, and other platform advertising for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'mon-seo-web', name: 'SEO & Website Manager', status: 'inactive', role: 'seo_content', family: 'marketing', department: 'Marketing', workspaceId: 1, model: 'claude', description: 'Monitors site health, indexing, broken links, and content updates for moneturamedia.com', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: null, lastRunStatus: null, executionCount: 0, successRate: 0 },
  { id: 'mon-inbound', name: 'Inbound Caller Agent', status: 'active', role: 'inbound_caller', family: 'sales', department: 'Sales', workspaceId: 1, model: 'vapi', description: 'Handles inbound calls for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 415, successRate: 93 },
  { id: 'mon-lead', name: 'Lead Qualifier Agent', status: 'active', role: 'lead_qualifier', family: 'sales', department: 'Sales', workspaceId: 1, model: 'claude', description: 'Qualifies leads for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 950, successRate: 96 },
  { id: 'mon-crm', name: 'CRM Manager Agent', status: 'active', role: 'crm_manager', family: 'operations', department: 'Operations', workspaceId: 1, model: 'claude', description: 'Manages CRM data for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 700, successRate: 99 },
  { id: 'mon-email', name: 'Email Writer Agent', status: 'active', role: 'email_writer', family: 'operations', department: 'Operations', workspaceId: 1, model: 'claude', description: 'Writes emails for Monetura Media', tools: [], constraints: {}, systemPrompt: '', createdAt: new Date(), lastRunAt: new Date(), lastRunStatus: 'success', executionCount: 180, successRate: 90 },
];

const WORKSPACE_MAP: Record<number, { name: string; agents: typeof SOLIS_AGENTS }> = {
  1: { name: 'Monetura', agents: MONETURA_AGENTS },
  2: { name: 'Solis Energy', agents: SOLIS_AGENTS },
  3: { name: 'QuotePath', agents: QUOTEPATH_AGENTS },
};

const statusColor: Record<string, string> = {
  active: '#22c55e',
  paused: '#eab308',
  error: '#ef4444',
  inactive: '#6b7280',
};

const DEPARTMENTS = ['Marketing', 'Sales', 'Operations'];

export default function AgentOrgChart({ workspaceId }: { workspaceId: number }) {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const workspace = WORKSPACE_MAP[workspaceId] || WORKSPACE_MAP[2];
  const agents = workspace.agents;

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
        {workspace.name}
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
          const deptAgents = agents.filter(a => a.department === dept);
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
