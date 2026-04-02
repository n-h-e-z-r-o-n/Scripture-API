import { NextRequest, NextResponse } from "next/server";
import { getBibleData, findBook } from "@/lib/bibleUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string }> }
) {
  const { bible, book } = await params;

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible '${bible}' not found` },
      { status: 404 }
    );
  }

  const bookData = findBook(bibleData, book);

  if (!bookData) {
    return NextResponse.json(
      { error: `Book '${book}' not found` },
      { status: 404 }
    );
  }

  let totalVerses = 0;

  const chapterSummary = bookData.chapters.map((chapter) => {
    const verseCount = chapter.verses.length;

    totalVerses += verseCount;

    return {
      chapter: chapter.chapter,
      verses: verseCount
    };
  });

  return NextResponse.json(
    {
      book: bookData.book,
      chapters: bookData.chapters.length,
      totalVerses,
      chapterSummary
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400"
      }
    }
  );
}
