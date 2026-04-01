import { NextRequest, NextResponse } from 'next/server';
import { getBibleData, findBook } from '@/lib/bibleUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> } // In Next 15+ Server Components / App Router, params are promises
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;
  
  const searchParams = request.nextUrl.searchParams;
  const bookName = searchParams.get('name');

  if (!bookName) {
    return NextResponse.json(
      { error: "Query parameter 'name' is required. Ex: /api/KJbible/book?name=Genesis" },
      { status: 400 }
    );
  }

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json({ error: `Bible version '${version}' not found.` }, { status: 404 });
  }

  const book = findBook(bibleData, bookName);
  if (!book) {
    return NextResponse.json({ error: `Book '${bookName}' not found.` }, { status: 404 });
  }

  // Return book summary (name + chapters without their full verses optionally, or just chapters numbers)
  return NextResponse.json({
    book: book.book,
    chapters: book.chapters.map(c => c.chapter)
  });
}
