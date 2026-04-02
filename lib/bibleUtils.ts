import { promises as fs } from 'fs';
import path from 'path';

export interface Verse {
  verse: string | number;
  text: string;
}

export interface Chapter {
  chapter: string | number;
  verses: Verse[];
}

export interface Book {
  book: string;
  chapters: Chapter[];
}

export type BibleData = Book[];

// In-memory cache for loaded Bibles
const bibleCache: Record<string, BibleData> = {};

/**
 * Lazily loads a Bible dataset from the /data folder based on the version name.
 * If already loaded, returns the cached data.
 */
export async function getBibleData(version: string): Promise<BibleData | null> {
  const sanitizedVersion = version.replace(/[^a-zA-Z0-9_-]/g, '');
  if (bibleCache[sanitizedVersion]) {
    return bibleCache[sanitizedVersion];
  }

  const filePath = path.join(process.cwd(), 'data', `${sanitizedVersion}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: BibleData = JSON.parse(fileContents);
    bibleCache[sanitizedVersion] = data;
    return data;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File not found
    }
    console.error(`Error reading ${version}.json:`, error);
    throw new Error('Internal Server Error');
  }
}

/** Returns available version names by reading the /data directory. */
export async function getAvailableVersions(): Promise<string[]> {
  const dataDir = path.join(process.cwd(), 'data');
  const files = await fs.readdir(dataDir);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

/**
 * Finds a book by name (case-insensitive, whitespace-insensitive).
 */
export function findBook(bibleData: BibleData, bookName: string): Book | undefined {
  const normalized = bookName.toLowerCase().replace(/\s+/g, '');
  return bibleData.find(
    (b) => b.book.toLowerCase().replace(/\s+/g, '') === normalized
  );
}

/**
 * Finds a chapter within a book. Handles both string and numeric chapter values.
 */
export function findChapter(book: Book, chapterNum: string | number): Chapter | undefined {
  const target = String(chapterNum);
  return book.chapters.find((c) => String(c.chapter) === target);
}

/**
 * Finds a specific verse within a chapter. Handles both string and numeric verse values.
 */
export function findVerse(chapter: Chapter, verseNum: string | number): Verse | undefined {
  const target = String(verseNum);
  return chapter.verses.find((v) => String(v.verse) === target);
}

/** Safely parses a chapter or verse field to a number. Falls back to the string. */
export function toNum(val: string | number): number {
  const n = parseInt(String(val), 10);
  return isNaN(n) ? (val as number) : n;
}

/** Standard CORS headers to attach to every API response. */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
