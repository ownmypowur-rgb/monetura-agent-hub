import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { listTasks, getProjectSummary } from '@/lib/tasks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized - provide Bearer token' }, { status: 401 });
  }

  try {
    const { projectId } = await params;
    const summary = await getProjectSummary(projectId);
    const allTasks = await listTasks({ projectId, limit: 100 });

    return NextResponse.json({
      ...summary,
      allTasks: allTasks.tasks,
      totalTasks: allTasks.total,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
