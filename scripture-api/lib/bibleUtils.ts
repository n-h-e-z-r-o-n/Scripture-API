import { promises as fs } from 'fs';
import path from 'path';

export interface Verse {
  verse: string;
  text: string;
}

export interface Chapter {
  chapter: string;
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
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null; // File not found
    }
    console.error(`Error reading ${version}.json:`, error);
    throw new Error('Internal Server Error');
  }
}

/**
 * Finds a book by name (case-insensitive).
 */
export function findBook(bibleData: BibleData, bookName: string): Book | undefined {
  const normalizedBookName = bookName.toLowerCase().replace(/\s+/g, '');
  return bibleData.find(
    (b) => b.book.toLowerCase().replace(/\s+/g, '') === normalizedBookName
  );
}

/**
 * Finds a chapter within a specific book.
 */
export function findChapter(book: Book, chapterNum: string): Chapter | undefined {
  return book.chapters.find((c) => c.chapter === chapterNum);
}

/**
 * Finds a specific verse within a chapter.
 */
export function findVerse(chapter: Chapter, verseNum: string): Verse | undefined {
  return chapter.verses.find((v) => v.verse === verseNum);
}
