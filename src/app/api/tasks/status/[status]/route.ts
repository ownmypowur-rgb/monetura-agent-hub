import { NextResponse } from 'next/server';
import { listTasks } from '@/lib/tasks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ status: string }> }
) {
  try {
    const { status } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const result = await listTasks({ page, limit, status });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
