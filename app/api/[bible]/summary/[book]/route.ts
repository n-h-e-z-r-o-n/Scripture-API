import { NextRequest } from "next/server";
import { findBook, getBibleData, getBibleVersionInfo } from "@/lib/bibleUtils";
import { cacheControl, errorResponse, jsonResponse } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string }> }
) {
  const { bible, book } = await params;

  const bibleData = await getBibleData(bible);
  const versionInfo = getBibleVersionInfo(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible '${bible}' not found`);
  }

  const bookData = findBook(bibleData, book);

  if (!bookData) {
    return errorResponse(404, `Book '${book}' not found`);
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

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      book: bookData.book,
      chapters: bookData.chapters.length,
      totalVerses,
      chapterSummary
    },
    {
      headers: cacheControl(86400)
    }
  );
}
