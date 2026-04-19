import { NextResponse } from "next/server";

export const maxDuration = 60;

const ORCHESTRATOR_URL = "http://146.190.254.94:8080";
const API_KEY = "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599";

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    let response;
    try {
      response = await fetch(`${ORCHESTRATOR_URL}/status/${params.taskId}`, {
        headers: { "x-api-key": API_KEY },
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json({ error: "Status check timeout" }, { status: 504 });
      }
      throw fetchErr;
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("Status proxy error:", err);
    return NextResponse.json(
      { error: err.message || "Proxy error" },
      { status: 502 }
    );
  }
}
