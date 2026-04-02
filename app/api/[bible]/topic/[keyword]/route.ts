import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, toNum } from '@/lib/bibleUtils';

// Example: A simple topic index mapping
// In production, you might load this from a JSON file or database
const topicIndex: Record<string, { book: string; chapter: number; verse: number }[]> = {
  faith: [
    { book: "Hebrews", chapter: 11, verse: 1 },
    { book: "Romans", chapter: 10, verse: 17 },
    { book: "Matthew", chapter: 17, verse: 20 },
  ],
  love: [
    { book: "John", chapter: 3, verse: 16 },
    { book: "1 Corinthians", chapter: 13, verse: 4 },
    { book: "Romans", chapter: 5, verse: 8 },
  ],
  hope: [
    { book: "Romans", chapter: 15, verse: 13 },
    { book: "Psalm", chapter: 42, verse: 5 },
  ],
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; keyword: string }> }
) {
  const { bible, keyword } = await params;

  if (!keyword) {
    return NextResponse.json(
      { error: "Path parameter 'keyword' is required. Example: /api/KJbible/topic/faith" },
      { status: 400, headers: corsHeaders }
    );
  }

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found. Use /api/versions to see available versions.` },
      { status: 404, headers: corsHeaders }
    );
  }

  const keywordLower = keyword.toLowerCase();
  const topicVerses = topicIndex[keywordLower];

  if (!topicVerses || topicVerses.length === 0) {
    return NextResponse.json(
      {
        version: bible,
        topic: keyword,
        count: 0,
        results: [],
        message: `No verses mapped for topic '${keyword}'.`,
      },
      { headers: corsHeaders }
    );
  }

  // Fetch the verse text from Bible data
  const results = topicVerses.map((ref) => {
    const bookData = bibleData.find((b) => b.book.toLowerCase() === ref.book.toLowerCase());
    if (!bookData) return null;
    const chapterData = bookData.chapters.find((c) => toNum(c.chapter) === ref.chapter);
    if (!chapterData) return null;
    const verseData = chapterData.verses.find((v) => toNum(v.verse) === ref.verse);
    if (!verseData) return null;
    return {
      book: bookData.book,
      chapter: toNum(chapterData.chapter),
      verse: toNum(verseData.verse),
      text: verseData.text,
    };
  }).filter(Boolean); // remove nulls

  return NextResponse.json(
    {
      version: bible,
      topic: keyword,
      count: results.length,
      results,
    },
    { headers: corsHeaders }
  );
}
