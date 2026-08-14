export interface BibleVersionInfo {
  id: string;
  fileName: string;
  name: string;
  abbreviation: string;
  language: string;
  copyrightStatus: 'public-domain' | 'licensed';
  aliases: string[];
}

export const REGISTERED_BIBLE_VERSIONS: readonly BibleVersionInfo[] = [
  {
    id: 'KJV',
    fileName: 'KJbible',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'English',
    copyrightStatus: 'public-domain',
    aliases: ['kjv', 'kjbible', 'kingjamesversion', 'kingjames'],
  },
];

function normalizeVersionKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const versionLookup = new Map<string, BibleVersionInfo>();

for (const version of REGISTERED_BIBLE_VERSIONS) {
  versionLookup.set(normalizeVersionKey(version.id), version);
  versionLookup.set(normalizeVersionKey(version.fileName), version);

  for (const alias of version.aliases) {
    versionLookup.set(normalizeVersionKey(alias), version);
  }
}

export function resolveBibleVersion(version: string): BibleVersionInfo | null {
  return versionLookup.get(normalizeVersionKey(version)) ?? null;
}
