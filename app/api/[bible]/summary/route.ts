import { NextRequest } from "next/server";
import { getBibleData, getBibleVersionInfo } from "@/lib/bibleUtils";
import { cacheControl, errorResponse, jsonResponse } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const bibleData = await getBibleData(bible);
  const versionInfo = getBibleVersionInfo(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible '${bible}' not found`);
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

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      name: versionInfo?.name ?? bible,
      books,
    },
    { headers: cacheControl(86400) }
  );
}
