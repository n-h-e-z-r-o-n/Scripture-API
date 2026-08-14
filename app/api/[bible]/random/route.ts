import { NextRequest } from 'next/server';
import { flattenBibleVerses, getBibleData, getBibleVersionInfo } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;
  const versionInfo = getBibleVersionInfo(version);

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return errorResponse(404, `Bible version '${version}' not found. Use /api/versions to see available versions.`);
  }

  const verses = flattenBibleVerses(bibleData);
  if (verses.length === 0) {
    return errorResponse(404, `No verse data found for '${version}'.`);
  }

  const verse = verses[Math.floor(Math.random() * verses.length)];

  return jsonResponse(
    {
      version: versionInfo?.id ?? version,
      ...verse,
    },
  );
}
