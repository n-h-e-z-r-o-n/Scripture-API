import { NextRequest } from 'next/server';
import { flattenBibleVerses, getBibleData, getBibleVersionInfo } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

// Canonical New Testament books
const NEW_TESTAMENT_BOOKS = [
  "Matthew","Mark","Luke","John","Acts","Romans",
  "1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John",
  "Jude","Revelation"
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;
  const versionInfo = getBibleVersionInfo(bible);

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found.`);
  }

  const ntVerses = flattenBibleVerses(bibleData, (book) => NEW_TESTAMENT_BOOKS.includes(book.book));

  if (ntVerses.length === 0) {
    return errorResponse(404, "New Testament books not found in this translation.");
  }

  const randomVerse = ntVerses[Math.floor(Math.random() * ntVerses.length)];

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      testament: "New",
      ...randomVerse
    },
  );
}
