import { NextResponse } from "next/server";

const ORCHESTRATOR_URL = "http://146.190.254.94:8080";
const ORCHESTRATOR_API_KEY = "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599";

export const maxDuration = 10;

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${ORCHESTRATOR_URL}/health`, {
      headers: { "x-api-key": ORCHESTRATOR_API_KEY },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ status: "error" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "unreachable" }, { status: 503 });
  }
}
