import { promises as fs } from 'fs';
import path from 'path';

export interface MotivationEntry {
  id: number;
  text: string;
}

export interface MotivationCategoryData {
  slug: string;
  title: string;
  entries: MotivationEntry[];
}

type MotivationFile = Record<string, string>;

const motivationDir = path.join(process.cwd(), 'data', 'bible_motivation');
let motivationCache: MotivationCategoryData[] | null = null;

function titleFromSlug(slug: string) {
  return slug
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function normalizeCategorySlug(slug: string) {
  return slug.trim().toLowerCase().replace(/[-\s]+/g, '_');
}

async function readMotivationFile(fileName: string): Promise<MotivationCategoryData> {
  const slug = fileName.replace(/\.json$/i, '');
  const filePath = path.join(motivationDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as MotivationFile;

  const entries = Object.entries(parsed)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([id, text]) => ({
      id: Number.parseInt(id, 10),
      text,
    }))
    .filter((entry) => Number.isInteger(entry.id) && typeof entry.text === 'string');

  return {
    slug,
    title: titleFromSlug(slug),
    entries,
  };
}

export async function getMotivationCategories(): Promise<MotivationCategoryData[]> {
  if (motivationCache) {
    return motivationCache;
  }

  const files = await fs.readdir(motivationDir);
  const jsonFiles = files
    .filter((file) => file.toLowerCase().endsWith('.json'))
    .sort((left, right) => left.localeCompare(right));

  const categories = await Promise.all(jsonFiles.map((file) => readMotivationFile(file)));
  motivationCache = categories;
  return categories;
}

export async function getMotivationCategory(
  category: string
): Promise<MotivationCategoryData | null> {
  const normalizedCategory = normalizeCategorySlug(category);
  const categories = await getMotivationCategories();

  return (
    categories.find((item) => item.slug === normalizedCategory) ??
    null
  );
}

export function parseCollectionWindow(
  limitParam: string | null,
  offsetParam: string | null,
  defaultLimit = 25
) {
  const limit = limitParam ? Number.parseInt(limitParam, 10) : defaultLimit;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

  return { limit, offset };
}

export function isValidCollectionWindow(limit: number, offset: number) {
  return Number.isInteger(limit) && limit >= 1 && limit <= 100
    && Number.isInteger(offset) && offset >= 0;
}
