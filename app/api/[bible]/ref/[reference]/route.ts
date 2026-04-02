import { NextRequest, NextResponse } from "next/server";
import {
  corsHeaders,
  getBibleData,
  findBook,
  findChapter,
  toNum,
} from "@/lib/bibleUtils";

/**
 * Simple parser for Bible references like:
 * "John 3:16-18" or "Genesis 1:31-2:3"
 */
function parseReference(ref: string) {
  // Split by spaces: ["John", "3:16-18"]
  const [bookName, versePart] = ref.split(" ", 2);
  if (!bookName || !versePart) return null;

  // Split chapter and verse range
  // "3:16-18" or "1:31-2:3"
  const rangeRegex = /^(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/;
  const match = versePart.match(rangeRegex);

  if (!match) return null;

  const startChapter = Number(match[1]);
  const startVerse = Number(match[2]);
  const endChapter = match[3] ? Number(match[3]) : startChapter;
  const endVerse = match[4] ? Number(match[4]) : startVerse;

  return {
    bookName,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; reference: string }> }
) {
  const { bible, reference } = await params;

  if (!reference) {
    return NextResponse.json(
      {
        error:
          "Reference parameter is required. Example: /api/KJbible/ref/John 3:16-18",
      },
      { status: 400, headers: corsHeaders }
    );
  }

  const ref = parseReference(decodeURIComponent(reference));
  if (!ref) {
    return NextResponse.json(
      { error: `Invalid reference format: '${reference}'` },
      { status: 400, headers: corsHeaders }
    );
  }

  const { bookName, startChapter, startVerse, endChapter, endVerse } = ref;

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found.` },
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

  // Collect verses across chapters if needed
  const verses: { chapter: number; verse: number; text: string }[] = [];

  for (let ch = startChapter; ch <= endChapter; ch++) {
    const chapterData = findChapter(book, ch);
    if (!chapterData) continue;

    // Determine start/end verses for this chapter
    const start = ch === startChapter ? startVerse : 1;
    const end = ch === endChapter ? endVerse : chapterData.verses.length;

    chapterData.verses.forEach((v) => {
      const vNum = toNum(v.verse);
      if (vNum >= start && vNum <= end) {
        verses.push({ chapter: ch, verse: vNum, text: v.text });
      }
    });
  }

  if (verses.length === 0) {
    return NextResponse.json(
      { error: `No verses found for reference '${reference}' in ${book.book}.` },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      version: bible,
      book: book.book,
      start: { chapter: startChapter, verse: startVerse },
      end: { chapter: endChapter, verse: endVerse },
      verseCount: verses.length,
      verses,
    },
    { headers: corsHeaders }
  );
}
