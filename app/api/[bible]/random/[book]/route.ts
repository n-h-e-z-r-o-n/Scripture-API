import { NextRequest } from 'next/server';
import { findBook, flattenBibleVerses, getBibleData, getBibleVersionInfo } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; book: string }> }
) {
  const { bible, book } = await params;
  const versionInfo = getBibleVersionInfo(bible);

  if (!book) {
    return errorResponse(400, "Book parameter is required. Example: /api/KJV/random/Genesis");
  }

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found. Use /api/versions to see available versions.`);
  }

  const bookData = findBook(bibleData, book);

  if (!bookData) {
    return errorResponse(404, `Book '${book}' not found in version '${bible}'.`);
  }

  const verses = flattenBibleVerses(bibleData, (candidate) => candidate.book === bookData.book);
  const verse = verses[Math.floor(Math.random() * verses.length)];

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      ...verse
    },
  );
}
