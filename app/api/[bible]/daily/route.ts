import { NextRequest } from 'next/server';
import { flattenBibleVerses, getBibleData, getBibleVersionInfo } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

function getDayOfYear() {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const current = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = current - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;
  const versionInfo = getBibleVersionInfo(bible);

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found. Use /api/versions to see available versions.`);
  }

  const allVerses = flattenBibleVerses(bibleData);

  if (allVerses.length === 0) {
    return errorResponse(404, `No verse data found for '${bible}'.`);
  }

  const dayIndex = getDayOfYear() % allVerses.length;
  const verse = allVerses[dayIndex];

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      date: new Date().toISOString().split('T')[0],
      ...verse,
    },
  );
}
