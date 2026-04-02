import { NextRequest, NextResponse } from 'next/server';
import {
  corsHeaders,
  findBook,
  findChapter,
  getBibleData,
  toNum,
} from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;
  const searchParams = request.nextUrl.searchParams;
  const bookName = searchParams.get('book');
  const chapterParam = searchParams.get('chapter');
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (!bookName || !chapterParam || !startParam || !endParam) {
    return NextResponse.json(
      {
        error:
          "Query parameters 'book', 'chapter', 'start', and 'end' are required. Example: /api/KJbible/passage?book=John&chapter=3&start=16&end=18",
      },
      { status: 400, headers: corsHeaders }
    );
  }

  const chapterNum = Number(chapterParam);
  const startNum = Number(startParam);
  const endNum = Number(endParam);

  if (
    !Number.isInteger(chapterNum) ||
    !Number.isInteger(startNum) ||
    !Number.isInteger(endNum) ||
    chapterNum < 1 ||
    startNum < 1 ||
    endNum < 1
  ) {
    return NextResponse.json(
      { error: "'chapter', 'start', and 'end' must be positive integers." },
      { status: 400, headers: corsHeaders }
    );
  }

  if (startNum > endNum) {
    return NextResponse.json(
      { error: "'start' cannot be greater than 'end'." },
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

  const chapterData = findChapter(book, chapterNum);
  if (!chapterData) {
    return NextResponse.json(
      { error: `Chapter ${chapterNum} not found in ${book.book}.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const verses = chapterData.verses
    .map((v) => ({
      verse: toNum(v.verse),
      text: v.text,
    }))
    .filter((v) => v.verse >= startNum && v.verse <= endNum);

  if (verses.length === 0) {
    return NextResponse.json(
      {
        error: `No verses found for range ${startNum}-${endNum} in ${book.book} ${chapterNum}.`,
      },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      version: bible,
      book: book.book,
      chapter: chapterNum,
      range: {
        start: startNum,
        end: endNum,
      },
      verseCount: verses.length,
      verses,
    },
    { headers: corsHeaders }
  );
}
