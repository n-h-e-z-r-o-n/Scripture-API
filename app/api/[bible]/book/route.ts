import { NextRequest, NextResponse } from 'next/server';
import { getBibleData, findBook, corsHeaders } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;
  const bookName = request.nextUrl.searchParams.get('name');

  if (!bookName) {
    return NextResponse.json(
      { error: "Query parameter 'name' is required. Example: /api/KJbible/book?name=Genesis" },
      { status: 400, headers: corsHeaders }
    );
  }

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found. Use /api/versions to see available versions.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const book = findBook(bibleData, bookName);
  if (!book) {
    return NextResponse.json(
      { error: `Book '${bookName}' not found in version '${bible}'.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      version: bible,
      book: book.book,
      chapterCount: book.chapters.length,
      chapters: book.chapters.map((c) => ({
        chapter: parseInt(String(c.chapter), 10) || c.chapter,
        verseCount: c.verses.length,
      })),
    },
    { headers: corsHeaders }
  );
}
