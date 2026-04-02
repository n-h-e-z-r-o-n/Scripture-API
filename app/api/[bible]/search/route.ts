import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, toNum } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;
  
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required. Ex: /api/KJbible/search?q=faith" },
      { status: 400, headers: corsHeaders }
    );
  }

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${version}' not found. Use /api/versions to see available versions.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const lowerQuery = query.toLowerCase();
  const results = [];
  
  // Search limit to prevent overwhelming responses
  const MAX_RESULTS = 100;

  for (const book of bibleData) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(lowerQuery)) {
          results.push({
            book: book.book,
            chapter: toNum(chapter.chapter),
            verse: toNum(verse.verse),
            text: verse.text
          });
          
          if (results.length >= MAX_RESULTS) {
            return NextResponse.json(
              {
                version,
                query,
                count: results.length,
                limitReached: true,
                message: `Results capped at ${MAX_RESULTS}.`,
                results,
              },
              { headers: corsHeaders }
            );
          }
        }
      }
    }
  }

  return NextResponse.json(
    {
      version,
      query,
      count: results.length,
      limitReached: false,
      results,
    },
    { headers: corsHeaders }
  );
}
