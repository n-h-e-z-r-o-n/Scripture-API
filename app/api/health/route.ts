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
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.floor(process.uptime()),
        api_version: '1.1.0',
        datasets: 'loaded-from-disk',
        bible_versions: versions.map((version) => version.id),
        bible_versions_count: versions.length,
      },
    );
  } catch (error) {
    console.error('Health check failed', error);
    return jsonResponse(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Unable to read bible datasets',
      },
      { status: 500 }
    );
  }
}
