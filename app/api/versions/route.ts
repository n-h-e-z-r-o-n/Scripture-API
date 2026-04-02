import { NextResponse } from 'next/server';
import { corsHeaders, getAvailableVersions } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const versions = await getAvailableVersions();
    return NextResponse.json({ versions, count: versions.length }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to read data directory', error);
    return NextResponse.json(
      { error: 'Failed to read available versions' },
      { status: 500, headers: corsHeaders }
    );
  }
}
