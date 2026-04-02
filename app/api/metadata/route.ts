import { NextResponse } from 'next/server';
import { corsHeaders, getAvailableVersions } from '@/lib/bibleUtils';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const versions = await getAvailableVersions();

    return NextResponse.json(
      {
        name: 'Scripture API',
        description: 'Lightweight multi-version Bible API',
        status: 'ok',
        api_version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentation: 'https://github.com/n-h-e-z-r-o-n/Scripture-API',
        contact: {
          author: 'Hezron Wekesa Nangulu',
        },
        endpoints: {
          metadata: '/api/metadata',
          versions: '/api/versions',
          health: '/api/health',
          books: '/api/{version}/books',
          book: '/api/{version}/book?name=Genesis',
          chapter: '/api/{version}/chapter?book=Genesis&chapter=1',
          verse: '/api/{version}/verse?book=Genesis&chapter=1&verse=1',
          search: '/api/{version}/search?q=faith',
          random: '/api/{version}/random',
          passage: '/api/{version}/passage?book=John&chapter=3&start=16&end=18',
          daily: '/api/{version}/daily',
        },
        versions: {
          count: versions.length,
          items: versions,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Failed to build metadata response', error);
    return NextResponse.json(
      { error: 'Failed to build API metadata' },
      { status: 500, headers: corsHeaders }
    );
  }
}
