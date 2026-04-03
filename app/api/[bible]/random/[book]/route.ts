import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, findBook, toNum } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string }> }
) {
  const { bible, book } = await params;

  if (!book) {
    return NextResponse.json(
      {
        error: "Book parameter is required. Example: /api/KJbible/random/book/Genesis"
      },
      { status: 400, headers: corsHeaders }
    );
  }

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      {
        error: `Bible version '${bible}' not found. Use /api/versions to see available versions.`
      },
      { status: 404, headers: corsHeaders }
    );
  }

  const bookData = findBook(bibleData, book);

  if (!bookData) {
    return NextResponse.json(
      {
        error: `Book '${book}' not found in version '${bible}'.`
      },
      { status: 404, headers: corsHeaders }
    );
  }

  // Pick random chapter
  const randomChapterIndex = Math.floor(Math.random() * bookData.chapters.length);
  const chapter = bookData.chapters[randomChapterIndex];

  // Pick random verse
  const randomVerseIndex = Math.floor(Math.random() * chapter.verses.length);
  const verse = chapter.verses[randomVerseIndex];

  return NextResponse.json(
    {
      version: bible,
      book: bookData.book,
      chapter: toNum(chapter.chapter),
      verse: toNum(verse.verse),
      text: verse.text
    },
    { headers: corsHeaders }
  );
}
