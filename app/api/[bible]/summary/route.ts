import { NextRequest, NextResponse } from "next/server";
import { getBibleData } from "@/lib/bibleUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible '${bible}' not found` },
      { status: 404 }
    );
  }

  const books = bibleData.map(book => {
    let bookVerseCount = 0;

    const chapters = book.chapters.map(chapter => {
      const verseCount = chapter.verses.length;

      bookVerseCount += verseCount;

      return {
        chapter: chapter.chapter,
        verses: verseCount
      };
    });

    return {
      name: book.book,
      chapters: book.chapters.length,
      verses: bookVerseCount,
      chapterSummary: chapters
    };
  });

  return NextResponse.json(
    { books },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400"
      }
    }
  );
}
