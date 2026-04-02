import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, toNum } from '@/lib/bibleUtils';

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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

  const allVerses: Array<{ book: string; chapter: number; verse: number; text: string }> = [];

  for (const book of bibleData) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        allVerses.push({
          book: book.book,
          chapter: toNum(chapter.chapter),
          verse: toNum(verse.verse),
          text: verse.text,
        });
      }
    }
  }

  if (allVerses.length === 0) {
    return NextResponse.json(
      { error: `No verse data found for '${bible}'.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const dayIndex = getDayOfYear() % allVerses.length;
  const verse = allVerses[dayIndex];

  return NextResponse.json(
    {
      version: bible,
      date: new Date().toISOString().split('T')[0],
      ...verse,
    },
    { headers: corsHeaders }
  );
}
