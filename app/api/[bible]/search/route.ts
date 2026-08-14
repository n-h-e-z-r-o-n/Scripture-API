import { NextRequest } from 'next/server';
import { getBibleData, getBibleVersionInfo, toNum } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;
  
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.trim();
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const versionInfo = getBibleVersionInfo(version);

  if (!query) {
    return errorResponse(400, "Query parameter 'q' is required. Example: /api/KJV/search?q=faith");
  }

  const limit = limitParam ? Number.parseInt(limitParam, 10) : 25;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return errorResponse(400, "Query parameter 'limit' must be an integer between 1 and 100.");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return errorResponse(400, "Query parameter 'offset' must be a non-negative integer.");
  }

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return errorResponse(404, `Bible version '${version}' not found. Use /api/versions to see available versions.`);
  }

  const lowerQuery = query.toLowerCase();
  const matches: Array<{ book: string; chapter: number; verse: number; text: string }> = [];

  for (const book of bibleData) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(lowerQuery)) {
          matches.push({
            book: book.book,
            chapter: toNum(chapter.chapter),
            verse: toNum(verse.verse),
            text: verse.text
          });
        }
      }
    }
  }

  const results = matches.slice(offset, offset + limit);

  return jsonResponse(
    {
      version: versionInfo?.id ?? version,
      query,
      offset,
      limit,
      returned: results.length,
      totalMatches: matches.length,
      hasMore: offset + results.length < matches.length,
      results,
    },
  );
}
