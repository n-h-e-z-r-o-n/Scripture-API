import { NextRequest } from 'next/server';
import { flattenBibleVerses, getBibleData, getBibleVersionInfo } from '@/lib/bibleUtils';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

// Canonical Old Testament books
const OLD_TESTAMENT_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
  "1 Kings","2 Kings","1 Chronicles","2 Chronicles",
  "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
  "Haggai","Zechariah","Malachi"
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

  const otVerses = flattenBibleVerses(bibleData, (book) => OLD_TESTAMENT_BOOKS.includes(book.book));

  if (otVerses.length === 0) {
    return errorResponse(404, "Old Testament books not found in this translation.");
  }

  const randomVerse = otVerses[Math.floor(Math.random() * otVerses.length)];

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      testament: "Old",
      ...randomVerse
    },
  );
}
