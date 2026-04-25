import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { getProjectSummary, getGlobalStats } from '@/lib/tasks';

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized - provide Bearer token' }, { status: 401 });
  }

  try {
    const projectIds = ['apex-crm', 'solis-energy', 'quotepath', 'monetura-hub'];
    const projects = await Promise.all(projectIds.map(id => getProjectSummary(id)));
    const global = await getGlobalStats();

    return NextResponse.json({
      global,
      projects,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
