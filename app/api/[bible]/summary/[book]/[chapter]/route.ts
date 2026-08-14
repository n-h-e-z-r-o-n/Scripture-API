import { NextRequest } from "next/server";
import { findBook, findChapter, getBibleData, getBibleVersionInfo, toNum } from "@/lib/bibleUtils";
import { cacheControl, errorResponse, jsonResponse } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string; chapter: string }> }
) {
  const { bible, book, chapter } = await params;

  const bibleData = await getBibleData(bible);
  const versionInfo = getBibleVersionInfo(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible '${bible}' not found.`);
  }

  const bookData = findBook(bibleData, book);

  if (!bookData) {
    return errorResponse(404, `Book '${book}' not found.`);
  }

  const chapterData = findChapter(bookData, chapter);

  if (!chapterData) {
    return errorResponse(404, `Chapter '${chapter}' not found in '${book}'.`);
  }

  const verseCount = chapterData.verses.length;
  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      book: bookData.book,
      chapter: toNum(chapterData.chapter),
      verses: verseCount
    },
    {
      headers: cacheControl(86400)
    }
  );
}
