import { NextResponse } from 'next/server';
import { createTask, listTasks } from '@/lib/tasks';
import { validateAnyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const projectId = url.searchParams.get('projectId') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const result = await listTasks({ page, limit, projectId, status });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!validateAnyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.projectId || !body.projectName || !body.brief) {
      return NextResponse.json(
        { error: 'projectId, projectName, and brief are required' },
        { status: 400 }
      );
    }

    const task = await createTask({
      projectId: body.projectId,
      projectName: body.projectName,
      brief: body.brief,
      claudeInstructions: body.claudeInstructions,
      parentTaskId: body.parentTaskId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
