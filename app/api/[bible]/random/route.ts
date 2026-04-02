import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, toNum } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${version}' not found. Use /api/versions to see available versions.` },
      { status: 404, headers: corsHeaders }
    );
  }

  // Pick a random book
  const randomBookIndex = Math.floor(Math.random() * bibleData.length);
  const book = bibleData[randomBookIndex];

  // Pick a random chapter
  const randomChapterIndex = Math.floor(Math.random() * book.chapters.length);
  const chapter = book.chapters[randomChapterIndex];

  // Pick a random verse
  const randomVerseIndex = Math.floor(Math.random() * chapter.verses.length);
  const verse = chapter.verses[randomVerseIndex];

  return NextResponse.json(
    {
      version,
      book: book.book,
      chapter: toNum(chapter.chapter),
      verse: toNum(verse.verse),
      text: verse.text,
    },
    { headers: corsHeaders }
  );
}
