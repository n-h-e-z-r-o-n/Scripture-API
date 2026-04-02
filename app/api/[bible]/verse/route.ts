import { NextRequest, NextResponse } from 'next/server';
import { getBibleData, findBook, findChapter, findVerse, toNum, corsHeaders } from '@/lib/bibleUtils';

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
  const chapterNum = searchParams.get('chapter');
  const verseNum = searchParams.get('verse');

  if (!bookName || !chapterNum || !verseNum) {
    return NextResponse.json(
      { error: "Query parameters 'book', 'chapter', and 'verse' are required. Example: /api/KJbible/verse?book=Genesis&chapter=1&verse=1" },
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

  const chapter = findChapter(book, chapterNum);
  if (!chapter) {
    return NextResponse.json(
      { error: `Chapter ${chapterNum} not found in ${book.book}.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const verse = findVerse(chapter, verseNum);
  if (!verse) {
    return NextResponse.json(
      { error: `Verse ${verseNum} not found in ${book.book} ${toNum(chapter.chapter)}.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      version: bible,
      book: book.book,
      chapter: toNum(chapter.chapter),
      verse: toNum(verse.verse),
      text: verse.text,
    },
    { headers: corsHeaders }
  );
}
