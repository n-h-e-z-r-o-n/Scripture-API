import { promises as fs } from 'fs';
import path from 'path';
import { REGISTERED_BIBLE_VERSIONS, resolveBibleVersion, type BibleVersionInfo } from '@/lib/versionCatalog';

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
export interface VerseLocation {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

// In-memory cache for loaded Bibles
const bibleCache: Record<string, BibleData> = {};

/**
 * Lazily loads a Bible dataset from the /data/bibles folder based on the version name.
 * If already loaded, returns the cached data.
 */
export async function getBibleData(version: string): Promise<BibleData | null> {
  const resolvedVersion = resolveBibleVersion(version);
  if (!resolvedVersion) {
    return null;
  }

  if (bibleCache[resolvedVersion.id]) {
    return bibleCache[resolvedVersion.id];
  }

  const filePath = path.join(process.cwd(), 'data', 'bibles', `${resolvedVersion.fileName}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data: BibleData = JSON.parse(fileContents);
    bibleCache[resolvedVersion.id] = data;
    return data;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File not found
    }
    console.error(`Error reading ${version}.json:`, error);
    throw new Error('Internal Server Error');
  }
}

/** Returns registered public versions whose dataset file is present. */
export async function getAvailableVersions(): Promise<BibleVersionInfo[]> {
  const versions = await Promise.all(
    REGISTERED_BIBLE_VERSIONS.map(async (version) => {
      const filePath = path.join(process.cwd(), 'data', 'bibles', `${version.fileName}.json`);

      try {
        await fs.access(filePath);
        return version;
      } catch {
        return null;
      }
    })
  );

  return versions.filter((version): version is BibleVersionInfo => version !== null);
}

export function getBibleVersionInfo(version: string): BibleVersionInfo | null {
  return resolveBibleVersion(version);
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
  return Number.isNaN(n) ? Number(val) : n;
}

/** Standard CORS headers to attach to every API response. */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function flattenBibleVerses(
  bibleData: BibleData,
  predicate?: (book: Book) => boolean
): VerseLocation[] {
  const verses: VerseLocation[] = [];

  for (const book of bibleData) {
    if (predicate && !predicate(book)) {
      continue;
    }

    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        verses.push({
          book: book.book,
          chapter: toNum(chapter.chapter),
          verse: toNum(verse.verse),
          text: verse.text,
        });
      }
    }
  }

  return verses;
}
