import { NextRequest, NextResponse } from "next/server";
import { getBibleData } from "@/lib/bibleUtils";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json({ error: `Bible '${bible}' not found` }, { status: 404 });
  }

  const allVerses = [];

  for (const book of bibleData) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        allVerses.push({
          book: book.book,
          chapter: chapter.chapter,
          verse: verse.verse,
          text: verse.text
        });
      }
    }
  }

  const dayIndex = getDayOfYear() % allVerses.length;
  const verse = allVerses[dayIndex];

  return NextResponse.json({
    date: new Date().toISOString().split("T")[0],
    ...verse
  });
}
