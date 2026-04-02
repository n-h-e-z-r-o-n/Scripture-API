import { NextResponse } from 'next/server';
import { corsHeaders, getAvailableVersions } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const versions = await getAvailableVersions();

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.floor(process.uptime()),
        api_version: '1.0.0',
        database: 'connected',
        bible_versions: versions,
        bible_versions_count: versions.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Health check failed', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Unable to read bible datasets',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
