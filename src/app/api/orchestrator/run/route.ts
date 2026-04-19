import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_URL = "http://146.190.254.94:8080";
const ORCHESTRATOR_API_KEY = "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599";

export const maxDuration = 10; // Vercel max for hobby plan

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Use AbortController with 8s timeout - orchestrator queues and returns taskId in <2s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${ORCHESTRATOR_URL}/run-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ORCHESTRATOR_API_KEY,
      },
      body: JSON.stringify({
        project: body.project || "apex-crm",
        task: body.task,
        mode: body.mode || "github",
        agent: body.agent,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Orchestrator error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Normalize: orchestrator returns { taskId, status }
    return NextResponse.json(
      { taskId: data.taskId || data.task_id, status: data.status || "queued" },
      { status: 202 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const isTimeout = msg.includes("abort") || msg.includes("timeout");
    return NextResponse.json(
      { error: isTimeout ? "Orchestrator request timed out" : msg },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
