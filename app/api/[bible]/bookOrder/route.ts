import { NextRequest, NextResponse } from "next/server";
import { getBibleData } from "@/lib/bibleUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const bibleData = await getBibleData(bible);

  if (!bibleData) {
    return NextResponse.json(
      { error: `Bible version '${bible}' not found.` },
      { status: 404 }
    );
  }

  const books = bibleData.map((book) => book.book);

  return NextResponse.json(
    { books },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400"
      }
    }
  );
}
