import { getAvailableVersions } from '@/lib/bibleUtils';
import { jsonResponse, optionsResponse } from '@/lib/api';

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const versions = await getAvailableVersions();
    return jsonResponse({
      count: versions.length,
      versions: versions.map((version) => ({
        id: version.id,
        name: version.name,
        abbreviation: version.abbreviation,
        language: version.language,
        aliases: version.aliases,
      })),
    });
  } catch (error) {
    console.error('Failed to read data directory', error);
    return jsonResponse(
      { error: 'Failed to read available versions' },
      { status: 500 }
    );
  }
}
