import { NextResponse } from "next/server";

export const maxDuration = 60;

const ORCHESTRATOR_URL = "https://orchestrator.moneturamedia.com";
const API_KEY = "7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    let response;
    try {
      response = await fetch(`${ORCHESTRATOR_URL}/run-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json(
          { error: "Orchestrator timeout - task may still be running" },
          { status: 504 }
        );
      }
      throw fetchErr;
    }

    if (!response.ok) {
      console.error(`Run route error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("Orchestrator proxy error:", err);
    return NextResponse.json(
      { error: err.message || "Proxy error" },
      { status: 502 }
    );
  }
}
