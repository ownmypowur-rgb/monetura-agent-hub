import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized - provide Bearer token' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, projectId, projectName, brief, status, testStatus, deploymentUrl, createdAt, completedAt
       FROM agent_tasks
       WHERE status IN ('complete', 'passed', 'failed')
       ORDER BY completedAt DESC
       LIMIT 10`
    );

    return NextResponse.json({ tasks: rows, generatedAt: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
