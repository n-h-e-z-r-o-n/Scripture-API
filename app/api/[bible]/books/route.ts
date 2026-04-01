import { NextRequest, NextResponse } from 'next/server';
import { getBibleData } from '@/lib/bibleUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const resolvedParams = await params;
  const version = resolvedParams.bible;

  const bibleData = await getBibleData(version);
  if (!bibleData) {
    return NextResponse.json({ error: `Bible version '${version}' not found.` }, { status: 404 });
  }

  return NextResponse.json({
    books: bibleData.map(b => b.book)
  });
}
