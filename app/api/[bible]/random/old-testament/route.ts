import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, toNum } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
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

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found.` },
      { status: 404, headers: corsHeaders }
    );
  }

  // Filter only Old Testament books
  const otBooks = bibleData.filter(book =>
    OLD_TESTAMENT_BOOKS.includes(book.book)
  );

  if (otBooks.length === 0) {
    return NextResponse.json(
      { error: "Old Testament books not found in this translation." },
      { status: 404, headers: corsHeaders }
    );
  }

  // Random book
  const randomBook = otBooks[Math.floor(Math.random() * otBooks.length)];

  // Random chapter
  const randomChapter =
    randomBook.chapters[Math.floor(Math.random() * randomBook.chapters.length)];

  // Random verse
  const randomVerse =
    randomChapter.verses[Math.floor(Math.random() * randomChapter.verses.length)];

  return NextResponse.json(
    {
      version: bible,
      testament: "Old",
      book: randomBook.book,
      chapter: toNum(randomChapter.chapter),
      verse: toNum(randomVerse.verse),
      text: randomVerse.text
    },
    { headers: corsHeaders }
  );
}
