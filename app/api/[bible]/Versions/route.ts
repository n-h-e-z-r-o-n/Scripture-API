import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const dataDir = path.join(process.cwd(), "data");

  const files = await fs.readdir(dataDir);

  const versions = files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));

  return NextResponse.json({
    versions
  });
}
