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
      { error: `Bible version '${bible}' not found. Use /api/versions to see available versions.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const chapterCount = bibleData.reduce((sum, book) => sum + book.chapters.length, 0);
  const verseCount = bibleData.reduce(
    (sum, book) => sum + book.chapters.reduce((inner, chapter) => inner + chapter.verses.length, 0),
    0
  );

  return NextResponse.json(
    {
      version: bible,
      status: 'ok',
      books: bibleData.length,
      chapters: chapterCount,
      verses: verseCount,
    },
    { headers: corsHeaders }
  );
}
