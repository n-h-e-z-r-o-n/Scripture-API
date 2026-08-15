import { NextRequest } from 'next/server';
import { errorResponse, jsonResponse, optionsResponse } from '@/lib/api';
import {
  getMotivationCategory,
  isValidCollectionWindow,
  parseCollectionWindow,
} from '@/lib/motivationUtils';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: categoryParam } = await params;
  const searchParams = request.nextUrl.searchParams;
  const randomParam = searchParams.get('random')?.trim().toLowerCase();
  const { limit, offset } = parseCollectionWindow(
    searchParams.get('limit'),
    searchParams.get('offset')
  );

  if (!isValidCollectionWindow(limit, offset)) {
    return errorResponse(400, "Query parameters 'limit' and 'offset' must be valid integers. 'limit' must be between 1 and 100, and 'offset' must be 0 or greater.");
  }

  const wantsRandom = randomParam === 'true' || randomParam === '1';

  try {
    const category = await getMotivationCategory(categoryParam);
    if (!category) {
      return errorResponse(404, `Motivation category '${categoryParam}' not found.`);
    }

    const motivations = wantsRandom
      ? [...category.entries]
          .sort(() => Math.random() - 0.5)
          .slice(0, limit)
      : category.entries.slice(offset, offset + limit);

    return jsonResponse({
      category: category.slug,
      title: category.title,
      total: category.entries.length,
      returned: motivations.length,
      offset: wantsRandom ? 0 : offset,
      limit,
      random: wantsRandom,
      motivations,
    });
  } catch (error) {
    console.error(`Failed to read motivation category '${categoryParam}'`, error);
    return errorResponse(500, 'Failed to load motivation category');
  }
}
