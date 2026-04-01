import { NextRequest, NextResponse } from 'next/server';
import { getBibleData } from '@/lib/bibleUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json({ error: `Bible version '${version}' not found.` }, { status: 404 });
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

  return NextResponse.json({
    book: book.book,
    chapter: parseInt(chapter.chapter) || chapter.chapter,
    verse: parseInt(verse.verse) || verse.verse,
    text: verse.text
  });
}
