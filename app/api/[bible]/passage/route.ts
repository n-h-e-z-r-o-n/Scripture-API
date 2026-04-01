import { NextRequest, NextResponse } from "next/server";
import { getBibleData, findBook } from "@/lib/bibleUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const searchParams = request.nextUrl.searchParams;

  const bookName = searchParams.get("book");
  const chapter = Number(searchParams.get("chapter"));
  const start = Number(searchParams.get("start"));
  const end = Number(searchParams.get("end"));

  if (!bookName || !chapter || !start || !end) {
    return NextResponse.json(
      { error: "Required params: book, chapter, start, end" },
      { status: 400 }
    );
  }

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return NextResponse.json({ error: `Bible '${bible}' not found` }, { status: 404 });
  }

  const book = findBook(bibleData, bookName);
  if (!book) {
    return NextResponse.json({ error: `Book '${bookName}' not found` }, { status: 404 });
  }

  const chapterData = book.chapters.find((c) => c.chapter === chapter);
  if (!chapterData) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const verses = chapterData.verses.filter(
    (v) => v.verse >= start && v.verse <= end
  );

  return NextResponse.json({
    book: book.book,
    chapter,
    verses
  });
}
