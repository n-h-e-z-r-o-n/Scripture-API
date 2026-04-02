import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;
  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: `Bible version '${bible}' not found. Use /api/versions to see available versions.`,
      },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: bible,
      books: bibleData.length,
    },
    { headers: corsHeaders }
  );
}
