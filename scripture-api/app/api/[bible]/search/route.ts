import { NextRequest, NextResponse } from 'next/server';
import { getBibleData } from '@/lib/bibleUtils';

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
      { status: 400 }
    );
  }

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json({ error: `Bible version '${version}' not found.` }, { status: 404 });
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
            chapter: parseInt(chapter.chapter) || chapter.chapter,
            verse: parseInt(verse.verse) || verse.verse,
            text: verse.text
          });
          
          if (results.length >= MAX_RESULTS) {
            return NextResponse.json({
              results,
              limitReached: true,
              message: `Results capped at ${MAX_RESULTS}.`
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ results });
}
