import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface AgentRow extends RowDataPacket {
  id: string;
  slug: string;
  name: string;
  division: string;
  tier: number;
  parentAgentId: string | null;
  description: string;
  executionMode: string;
  n8nWorkflowId: string | null;
  status: string;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const division = searchParams.get("division");
    const workspaceId = searchParams.get("workspaceId");

    let query = "SELECT * FROM monetura_agents";
    const params: string[] = [];

    if (division) {
      query += " WHERE division = ?";
      params.push(division);
    }

    query += " ORDER BY tier ASC, name ASC";

    const [rows] = await pool.query<AgentRow[]>(query, params);

    const agents = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      family: row.division,
      tier: row.tier,
      status: row.status as "active" | "paused" | "error" | "idle",
      workspaceId: workspaceId ? Number(workspaceId) : 1,
      description: row.description,
      lastRun: row.lastRunAt ?? undefined,
      lastRunStatus: row.lastRunStatus ?? undefined,
      executionMode: row.executionMode,
      n8nWorkflowId: row.n8nWorkflowId ?? undefined,
      parentId: row.parentAgentId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    const summary = {
      total: agents.length,
      active: agents.filter((a) => a.status === "active").length,
      paused: agents.filter((a) => a.status === "paused").length,
      error: agents.filter((a) => a.status === "error").length,
      idle: agents.filter((a) => a.status === "idle").length,
    };

    const divisions = [...new Set(agents.map((a) => a.family))];

    return NextResponse.json({
      agents,
      summary,
      divisions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Orchestrator status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orchestrator status" },
      { status: 500 }
    );
  }
}
