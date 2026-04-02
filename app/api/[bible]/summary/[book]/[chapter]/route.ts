import { NextRequest, NextResponse } from "next/server";
import { getBibleData, findBook, findChapter, toNum } from "@/lib/bibleUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string; chapter: string }> }
) {
  const { bible, book, chapter } = await params;

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible '${bible}' not found.` },
      { status: 404 }
    );
  }

  const bookData = findBook(bibleData, book);

  if (!bookData) {
    return NextResponse.json(
      { error: `Book '${book}' not found.` },
      { status: 404 }
    );
  }

  const chapterData = findChapter(bookData, chapter);

  if (!chapterData) {
    return NextResponse.json(
      { error: `Chapter '${chapter}' not found in '${book}'.` },
      { status: 404 }
    );
  }

  const verseCount = chapterData.verses.length;
  return NextResponse.json(
    {
      book: bookData.book,
      chapter: toNum(chapterData.chapter),
      verses: verseCount
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400"
      }
    }
  );
}
