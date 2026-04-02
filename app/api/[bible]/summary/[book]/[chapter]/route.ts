import { NextRequest, NextResponse } from "next/server";
import { getBibleData, findBook } from "@/lib/bibleUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string; chapter: string }> }
) {
  const { bible, book, chapter } = await params;

  const chapterNumber = Number(chapter);

  if (isNaN(chapterNumber)) {
    return NextResponse.json(
      { error: "Chapter must be a number." },
      { status: 400 }
    );
  }

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

  const chapterData = bookData.chapters.find(
    (c) => c.chapter === chapterNumber
  );

  if (!chapterData) {
    return NextResponse.json(
      { error: `Chapter '${chapterNumber}' not found in '${book}'.` },
      { status: 404 }
    );
  }

  const verseCount = chapterData.verses.length;

  return NextResponse.json(
    {
      book: bookData.book,
      chapter: chapterNumber,
      verses: verseCount
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400"
      }
    }
  );
}
