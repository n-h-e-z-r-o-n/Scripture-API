import { NextRequest } from "next/server";
import {
  getBibleData,
  findBook,
  findChapter,
  getBibleVersionInfo,
  toNum,
} from "@/lib/bibleUtils";
import { errorResponse, jsonResponse } from "@/lib/api";

/**
 * Simple parser for Bible references like:
 * "John 3:16-18" or "Genesis 1:31-2:3"
 */
function parseReference(ref: string) {
  const trimmed = ref.trim().replace(/\s+/g, " ");
  const match = trimmed.match(/^(.+?)\s+(\d+:\d+(?:-\d+(?::\d+)?)?)$/);

  if (!match) {
    return null;
  }

  const bookName = match[1];
  const versePart = match[2];

  // Split chapter and verse range
  // "3:16-18" or "1:31-2:3"
  const rangeRegex = /^(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/;
  const rangeMatch = versePart.match(rangeRegex);

  if (!rangeMatch) return null;

  const startChapter = Number(rangeMatch[1]);
  const startVerse = Number(rangeMatch[2]);
  const endChapter = rangeMatch[3] ? Number(rangeMatch[3]) : startChapter;
  const endVerse = rangeMatch[4] ? Number(rangeMatch[4]) : startVerse;

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
  const versionInfo = getBibleVersionInfo(bible);

  if (!reference) {
    return errorResponse(400, "Reference parameter is required. Example: /api/KJV/ref/John%203%3A16-18");
  }

  const ref = parseReference(decodeURIComponent(reference));
  if (!ref) {
    return errorResponse(400, `Invalid reference format: '${reference}'`);
  }

  const { bookName, startChapter, startVerse, endChapter, endVerse } = ref;

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found.`);
  }

  const book = findBook(bibleData, bookName);
  if (!book) {
    return errorResponse(404, `Book '${bookName}' not found in version '${bible}'.`);
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
    return errorResponse(404, `No verses found for reference '${reference}' in ${book.book}.`);
  }

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      book: book.book,
      start: { chapter: startChapter, verse: startVerse },
      end: { chapter: endChapter, verse: endVerse },
      verseCount: verses.length,
      verses,
    },
  );
}
