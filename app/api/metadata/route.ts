import { getAvailableVersions } from '@/lib/bibleUtils';
import { jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const versions = await getAvailableVersions();

    return jsonResponse(
      {
        name: 'Scripture API',
        description: 'Lightweight Bible API for registered public-domain datasets',
        status: 'ok',
        api_version: '1.1.0',
        timestamp: new Date().toISOString(),
        documentation: 'https://github.com/n-h-e-z-r-o-n/Scripture-API',
        contact: {
          author: 'Hezron Wekesa Nangulu',
        },
        endpoints: {
          metadata: '/api/metadata',
          versions: '/api/versions',
          health: '/api/health',
          motivations: '/api/motivations',
          motivation_category: '/api/motivations/{category}',
          books: '/api/{version}/books',
          book: '/api/{version}/book?name=Genesis',
          chapter: '/api/{version}/chapter?book=Genesis&chapter=1',
          verse: '/api/{version}/verse?book=Genesis&chapter=1&verse=1',
          search: '/api/{version}/search?q=faith',
          random: '/api/{version}/random',
          passage: '/api/{version}/passage?book=John&chapter=3&start=16&end=18',
          reference: '/api/{version}/ref/John%203%3A16-18',
          daily: '/api/{version}/daily',
        },
        versions: {
          count: versions.length,
          items: versions.map((version) => ({
            id: version.id,
            name: version.name,
            abbreviation: version.abbreviation,
            language: version.language,
          })),
        },
      },
    );
  } catch (error) {
    console.error('Failed to build metadata response', error);
    return jsonResponse(
      { error: 'Failed to build API metadata' },
      { status: 500 }
    );
  }
}
