import { NextRequest, NextResponse } from 'next/server';

const ORCHESTRATOR_URL = 'http://146.190.254.94:8080';
const API_KEY = '7d7f64cdd061fa2ccce94cba04acccca9e8bc4acceffbdf53400aa67c6d55599';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${ORCHESTRATOR_URL}/run-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Orchestrator proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to orchestrator' },
      { status: 502 }
    );
  }
}
