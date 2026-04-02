import { NextRequest, NextResponse } from 'next/server';
import { getBibleData, corsHeaders } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found. Use /api/versions to see available versions.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      version: bible,
      count: bibleData.length,
      books: bibleData.map((b) => ({
        name: b.book,
        chapters: b.chapters.length,
      })),
    },
    { headers: corsHeaders }
  );
}
