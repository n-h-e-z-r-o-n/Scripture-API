import { NextRequest, NextResponse } from 'next/server';
import { getBibleData, findBook, findChapter, toNum, corsHeaders } from '@/lib/bibleUtils';

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

  if (!bookName || !chapterNum) {
    return NextResponse.json(
      { error: "Query parameters 'book' and 'chapter' are required. Example: /api/KJbible/chapter?book=Genesis&chapter=1" },
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
      { error: `Chapter ${chapterNum} not found in ${book.book}. It has ${book.chapters.length} chapters.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      version: bible,
      book: book.book,
      chapter: toNum(chapter.chapter),
      verseCount: chapter.verses.length,
      verses: chapter.verses.map((v) => ({
        verse: toNum(v.verse),
        text: v.text,
      })),
    },
    { headers: corsHeaders }
  );
}
