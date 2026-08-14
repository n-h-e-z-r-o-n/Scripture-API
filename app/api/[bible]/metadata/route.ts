import { NextRequest } from 'next/server';
import { getBibleData, getBibleVersionInfo } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;
  const bibleData = await getBibleData(bible);
  const versionInfo = getBibleVersionInfo(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found. Use /api/versions to see available versions.`);
  }

  const chapterCount = bibleData.reduce((sum, book) => sum + book.chapters.length, 0);
  const verseCount = bibleData.reduce(
    (sum, book) => sum + book.chapters.reduce((inner, chapter) => inner + chapter.verses.length, 0),
    0
  );

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      name: versionInfo?.name ?? bible,
      abbreviation: versionInfo?.abbreviation ?? bible,
      language: versionInfo?.language ?? 'Unknown',
      status: 'ok',
      books: bibleData.length,
      chapters: chapterCount,
      verses: verseCount,
    },
  );
}
