import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/migrate';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.ORCHESTRATOR_SECRET || process.env.MEMORY_API_KEY;

  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await runMigrations();
    return NextResponse.json({ success: true, message: 'Migrations complete' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
