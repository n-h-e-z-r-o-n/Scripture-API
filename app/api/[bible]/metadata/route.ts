import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Bible API",
    description: "Lightweight multi-version Bible API",
    versions_endpoint: "/api/versions",
    documentation: "https://github.com/n-h-e-z-r-o-n/Scripture-API",
    author: "Hezron Wekesa Nangulu"
  });
}
