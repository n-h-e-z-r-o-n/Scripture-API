import { NextRequest } from 'next/server';
import { findBook, getBibleData, getBibleVersionInfo, toNum } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

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
    { book: "Psalms", chapter: 42, verse: 5 },
  ],
};

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string; keyword: string }> }
) {
  const { bible, keyword } = await params;
  const versionInfo = getBibleVersionInfo(bible);

  if (!keyword) {
    return errorResponse(400, "Path parameter 'keyword' is required. Example: /api/KJV/topic/faith");
  }

  const bibleData = await getBibleData(bible);
  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found. Use /api/versions to see available versions.`);
  }

  const keywordLower = keyword.toLowerCase();
  const topicVerses = topicIndex[keywordLower];

  if (!topicVerses || topicVerses.length === 0) {
    return jsonResponse(
      {
        version: versionInfo?.id ?? bible,
        topic: keyword,
        count: 0,
        results: [],
        message: `No verses mapped for topic '${keyword}'.`,
      },
    );
  }

  // Fetch the verse text from Bible data
  const results = topicVerses.map((ref) => {
    const bookData = findBook(bibleData, ref.book);
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

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      topic: keyword,
      count: results.length,
      results,
    },
  );
}
