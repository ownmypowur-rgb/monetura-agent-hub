import { NextRequest, NextResponse } from 'next/server';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'https://orchestrator.moneturamedia.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get('division');
    const workspaceId = searchParams.get('workspaceId');

    const orchestratorRes = await fetch(`${ORCHESTRATOR_URL}/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!orchestratorRes.ok) {
      throw new Error(`Orchestrator responded with ${orchestratorRes.status}`);
    }

    const data = await orchestratorRes.json();
    let agents: any[] = Array.isArray(data) ? data : (data.agents || []);

    if (division && division !== 'all') {
      agents = agents.filter((a: any) => a.division === division);
    }

    const summary = {
      total: agents.length,
      active: agents.filter((a: any) => a.status === 'active').length,
      idle: agents.filter((a: any) => a.status === 'idle').length,
      error: agents.filter((a: any) => a.status === 'error').length,
      disabled: agents.filter((a: any) => a.status === 'disabled').length,
    };

    const divisionMap = new Map<string, { name: string; agentCount: number; activeCount: number }>();
    for (const agent of agents) {
      const div = agent.division || 'Unknown';
      if (!divisionMap.has(div)) {
        divisionMap.set(div, { name: div, agentCount: 0, activeCount: 0 });
      }
      const entry = divisionMap.get(div)!;
      entry.agentCount++;
      if (agent.status === 'active') entry.activeCount++;
    }

    return NextResponse.json({
      agents,
      summary,
      divisions: Array.from(divisionMap.values()),
      workspaceId: workspaceId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Orchestrator status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orchestrator status',
        details: error.message,
        agents: [],
        summary: { total: 0, active: 0, idle: 0, error: 0, disabled: 0 },
        divisions: [],
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
