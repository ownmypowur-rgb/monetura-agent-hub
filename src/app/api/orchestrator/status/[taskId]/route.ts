import { NextRequest, NextResponse } from "next/server";

const ORCHESTRATOR_URL = "http://146.190.254.94:8080";
const ORCHESTRATOR_API_KEY = "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599";

export const maxDuration = 10;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${ORCHESTRATOR_URL}/status/${taskId}`, {
      headers: { "x-api-key": ORCHESTRATOR_API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
