import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      frontend: 'OK',
      backend: data,
      integration: 'Connected',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      frontend: 'OK',
      backend: 'ERROR',
      integration: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
