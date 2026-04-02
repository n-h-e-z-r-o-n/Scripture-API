import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, getAvailableVersions } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  try {
    const versions = await getAvailableVersions();
    const bibleData = await getBibleData(bible);

    return NextResponse.json(
      {
        requestedVersion: bible,
        exists: Boolean(bibleData),
        versions,
        count: versions.length,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Failed to read versions', error);
    return NextResponse.json(
      { error: 'Failed to read available versions' },
      { status: 500, headers: corsHeaders }
    );
  }
}
