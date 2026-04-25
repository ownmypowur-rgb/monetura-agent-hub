import pool from './db';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface AgentTask {
  id: string;
  projectId: string;
  projectName: string;
  brief: string;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'testing' | 'passed';
  logs: string | null;
  claudeInstructions: string | null;
  deploymentUrl: string | null;
  testStatus: 'pending' | 'passed' | 'failed';
  testNotes: string | null;
  errorMessage: string | null;
  parentTaskId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export async function createTask(data: {
  projectId: string;
  projectName: string;
  brief: string;
  claudeInstructions?: string;
  parentTaskId?: string;
}): Promise<AgentTask> {
  const id = uuidv4();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO agent_tasks (id, projectId, projectName, brief, claudeInstructions, parentTaskId, status, testStatus)
       VALUES (?, ?, ?, ?, ?, ?, 'queued', 'pending')`,
      [id, data.projectId, data.projectName, data.brief, data.claudeInstructions || null, data.parentTaskId || null]
    );
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM agent_tasks WHERE id = ?', [id]);
    return rows[0] as AgentTask;
  } finally {
    conn.release();
  }
}

export async function getTask(id: string): Promise<AgentTask | null> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM agent_tasks WHERE id = ?', [id]);
  return (rows[0] as AgentTask) || null;
}

export async function listTasks(opts: {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: string;
}): Promise<{ tasks: AgentTask[]; total: number; page: number; limit: number }> {
  const page = opts.page || 1;
  const limit = Math.min(opts.limit || 20, 100);
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (opts.projectId) {
    where += ' AND projectId = ?';
    params.push(opts.projectId);
  }
  if (opts.status) {
    where += ' AND status = ?';
    params.push(opts.status);
  }

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM agent_tasks ${where}`, params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM agent_tasks ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { tasks: rows as AgentTask[], total, page, limit };
}

export async function updateTask(id: string, data: Partial<{
  status: string;
  logs: string;
  claudeInstructions: string;
  deploymentUrl: string;
  testStatus: string;
  testNotes: string;
  errorMessage: string;
  completedAt: string;
}>): Promise<AgentTask | null> {
  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return getTask(id);

  // Auto-set completedAt when status becomes complete/passed/failed
  if (data.status && ['complete', 'passed', 'failed'].includes(data.status) && !data.completedAt) {
    fields.push('completedAt = NOW()');
  }

  values.push(id);
  await pool.query(
    `UPDATE agent_tasks SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getTask(id);
}

export async function appendLogs(id: string, newLines: string): Promise<void> {
  await pool.query(
    `UPDATE agent_tasks SET logs = CONCAT(COALESCE(logs, ''), ?) WHERE id = ?`,
    [newLines, id]
  );
}

export async function deleteTask(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM agent_tasks WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getProjectSummary(projectId: string) {
  const [tasks] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM agent_tasks WHERE projectId = ? ORDER BY createdAt DESC LIMIT 5`,
    [projectId]
  );

  const [openIssues] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM agent_tasks WHERE projectId = ? AND status = 'failed' AND id NOT IN (
      SELECT COALESCE(parentTaskId, '') FROM agent_tasks WHERE parentTaskId IS NOT NULL AND status IN ('complete', 'passed')
    ) ORDER BY createdAt DESC`,
    [projectId]
  );

  const [lastDeployRow] = await pool.query<RowDataPacket[]>(
    `SELECT deploymentUrl FROM agent_tasks WHERE projectId = ? AND deploymentUrl IS NOT NULL ORDER BY createdAt DESC LIMIT 1`,
    [projectId]
  );

  const [stats] = await pool.query<RowDataPacket[]>(
    `SELECT
      COUNT(*) as totalTasks,
      SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passedTasks,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedTasks,
      MAX(completedAt) as lastBuilt
    FROM agent_tasks WHERE projectId = ?`,
    [projectId]
  );

  const projectNames: Record<string, string> = {
    'apex-crm': 'Apex CRM',
    'solis-energy': 'Solis Energy',
    'quotepath': 'QuotePath',
    'monetura-hub': 'Monetura Agent Hub',
  };

  const techStacks: Record<string, string[]> = {
    'apex-crm': ['Next.js', 'React', 'tRPC', 'MySQL', 'Drizzle ORM'],
    'solis-energy': ['Next.js', 'React', 'Tailwind CSS', 'MySQL'],
    'quotepath': ['Next.js', 'React', 'Tailwind CSS', 'MySQL'],
    'monetura-hub': ['Next.js', 'React', 'Tailwind CSS', 'MySQL', 'Recharts'],
  };

  const s = stats[0] || {};
  const passRate = s.totalTasks > 0 ? Math.round((s.passedTasks / s.totalTasks) * 100) : 0;

  return {
    project: projectId,
    projectName: projectNames[projectId] || projectId,
    lastBuilt: s.lastBuilt || null,
    recentTasks: tasks,
    currentStatus: (openIssues as any[]).length > 0 ? 'issues' : 'stable',
    lastDeployment: lastDeployRow[0]?.deploymentUrl || null,
    openIssues: openIssues,
    techStack: techStacks[projectId] || [],
    stats: {
      totalTasks: s.totalTasks || 0,
      passedTasks: s.passedTasks || 0,
      failedTasks: s.failedTasks || 0,
      passRate,
    },
    summary: `${projectNames[projectId] || projectId}: ${s.totalTasks || 0} tasks total, ${passRate}% pass rate, ${(openIssues as any[]).length} open issues.`,
  };
}

export async function getGlobalStats() {
  const [todayStats] = await pool.query<RowDataPacket[]>(
    `SELECT
      COUNT(*) as tasksToday,
      SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passedToday,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedToday
    FROM agent_tasks WHERE DATE(createdAt) = CURDATE()`
  );

  const [activeProjects] = await pool.query<RowDataPacket[]>(
    `SELECT DISTINCT projectId FROM agent_tasks WHERE DATE(createdAt) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
  );

  const [recentTasks] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM agent_tasks ORDER BY createdAt DESC LIMIT 20`
  );

  const s = todayStats[0] || {};
  return {
    tasksToday: s.tasksToday || 0,
    passedToday: s.passedToday || 0,
    failedToday: s.failedToday || 0,
    passRate: s.tasksToday > 0 ? Math.round((s.passedToday / s.tasksToday) * 100) : 100,
    activeProjects: (activeProjects as any[]).length,
    recentTasks,
  };
}
