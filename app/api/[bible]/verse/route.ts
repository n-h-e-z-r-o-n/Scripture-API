import { NextRequest, NextResponse } from 'next/server';
import { getBibleData, findBook, findChapter, findVerse } from '@/lib/bibleUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;
  
  const searchParams = request.nextUrl.searchParams;
  const bookName = searchParams.get('book');
  const chapterNum = searchParams.get('chapter');
  const verseNum = searchParams.get('verse');

  if (!bookName || !chapterNum || !verseNum) {
    return NextResponse.json(
      { error: "Query parameters 'book', 'chapter', and 'verse' are required. Ex: /api/KJbible/verse?book=Genesis&chapter=1&verse=1" },
      { status: 400 }
    );
  }

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json({ error: `Bible version '${version}' not found.` }, { status: 404 });
  }

  const book = findBook(bibleData, bookName);
  if (!book) {
    return NextResponse.json({ error: `Book '${bookName}' not found.` }, { status: 404 });
  }

  const chapter = findChapter(book, chapterNum);
  if (!chapter) {
    return NextResponse.json({ error: `Chapter '${chapterNum}' not found in ${book.book}.` }, { status: 404 });
  }

  const verse = findVerse(chapter, verseNum);
  if (!verse) {
    return NextResponse.json({ error: `Verse '${verseNum}' not found in ${book.book} ${chapter.chapter}.` }, { status: 404 });
  }

  return NextResponse.json({
    book: book.book,
    chapter: parseInt(chapter.chapter) || chapter.chapter,
    verse: parseInt(verse.verse) || verse.verse,
    text: verse.text
  });
}
