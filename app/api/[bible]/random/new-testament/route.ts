import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, getBibleData, toNum } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
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

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found.` },
      { status: 404, headers: corsHeaders }
    );
  }

  // Filter only New Testament books
  const ntBooks = bibleData.filter(book =>
    NEW_TESTAMENT_BOOKS.includes(book.book)
  );

  if (ntBooks.length === 0) {
    return NextResponse.json(
      { error: "New Testament books not found in this translation." },
      { status: 404, headers: corsHeaders }
    );
  }

  // Pick random book
  const randomBook = ntBooks[Math.floor(Math.random() * ntBooks.length)];

  // Pick random chapter
  const randomChapter =
    randomBook.chapters[Math.floor(Math.random() * randomBook.chapters.length)];

  // Pick random verse
  const randomVerse =
    randomChapter.verses[Math.floor(Math.random() * randomChapter.verses.length)];

  return NextResponse.json(
    {
      version: bible,
      testament: "New",
      book: randomBook.book,
      chapter: toNum(randomChapter.chapter),
      verse: toNum(randomVerse.verse),
      text: randomVerse.text
    },
    { headers: corsHeaders }
  );
}
