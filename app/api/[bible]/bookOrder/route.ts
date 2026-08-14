import { NextRequest } from "next/server";
import { getBibleData, getBibleVersionInfo } from "@/lib/bibleUtils";
import { cacheControl, errorResponse, jsonResponse } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bible: string }> }
) {
  const { bible } = await params;

  const bibleData = await getBibleData(bible);
  const versionInfo = getBibleVersionInfo(bible);

  if (!bibleData) {
    return errorResponse(404, `Bible version '${bible}' not found.`);
  }

  const books = bibleData.map((book) => book.book);

  return jsonResponse(
    {
      version: versionInfo?.id ?? bible,
      books,
    },
    {
      headers: cacheControl(86400)
    }
  );
}
