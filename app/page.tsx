import { getAvailableVersions } from '@/lib/bibleUtils';

type EndpointParameter = {
  description: string;
  name: string;
  required: boolean;
  location: 'path' | 'query';
};

type EndpointDoc = {
  id: string;
  path: string;
  title: string;
  description: string;
  exampleRequest?: string;
  params?: EndpointParameter[];
  notes?: string[];
  response: unknown;
};

type EndpointGroup = {
  id: string;
  title: string;
  description: string;
  endpoints: EndpointDoc[];
};

const endpointGroups: EndpointGroup[] = [
  {
    id: 'system',
    title: 'System',
    description: 'Global endpoints for discovery, service metadata, and deployment health.',
    endpoints: [
      {
        id: 'versions',
        title: 'Available Versions',
        path: '/api/versions',
        description: 'Lists the registered public-domain datasets currently exposed by the API.',
        response: {
          count: 1,
          versions: [
            {
              id: 'KJV',
              name: 'King James Version',
              abbreviation: 'KJV',
              language: 'English',
              aliases: ['kjv', 'kjbible', 'kingjamesversion', 'kingjames'],
            },
          ],
        },
      },
      {
        id: 'metadata',
        title: 'API Metadata',
        path: '/api/metadata',
        description: 'Describes the API version, documentation source, version catalog, and canonical endpoint patterns.',
        response: {
          name: 'Scripture API',
          description: 'Lightweight Bible API for registered public-domain datasets',
          status: 'ok',
          api_version: '1.1.0',
          timestamp: '2026-08-14T19:30:18.000Z',
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
            reference: '/api/{version}/ref/John%203%3A16-18',
            daily: '/api/{version}/daily',
          },
          versions: {
            count: 1,
            items: [
              {
                id: 'KJV',
                name: 'King James Version',
                abbreviation: 'KJV',
                language: 'English',
              },
            ],
          },
        },
      },
      {
        id: 'health',
        title: 'API Health',
        path: '/api/health',
        description: 'Reports whether the service can read its configured datasets.',
        response: {
          status: 'ok',
          timestamp: '2026-08-14T19:30:18.000Z',
          uptime_seconds: 3912,
          api_version: '1.1.0',
          datasets: 'loaded-from-disk',
          bible_versions: ['KJV'],
          bible_versions_count: 1,
        },
      },
    ],
  },
  {
    id: 'catalog',
    title: 'Catalog & Health',
    description: 'Version-scoped metadata, structure summaries, and health checks.',
    endpoints: [
      {
        id: 'version-health',
        title: 'Version Health',
        path: '/api/{version}/health',
        description: 'Reports whether a specific translation can be resolved and loaded.',
        exampleRequest: '/api/KJV/health',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias such as KJV or KJbible.' }],
        response: {
          status: 'ok',
          timestamp: '2026-08-14T19:30:18.000Z',
          version: 'KJV',
          books: 66,
        },
      },
      {
        id: 'version-metadata',
        title: 'Version Metadata',
        path: '/api/{version}/metadata',
        description: 'Returns normalized version info plus top-level book, chapter, and verse totals.',
        exampleRequest: '/api/KJV/metadata',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          name: 'King James Version',
          abbreviation: 'KJV',
          language: 'English',
          status: 'ok',
          books: 66,
          chapters: 1189,
          verses: 31102,
        },
      },
      {
        id: 'book-order',
        title: 'Book Order',
        path: '/api/{version}/bookOrder',
        description: 'Returns the books in canonical reading order for the selected translation.',
        exampleRequest: '/api/KJV/bookOrder',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
        },
        notes: ['This route is cache-friendly and returns the current dataset ordering.'],
      },
      {
        id: 'books',
        title: 'Books Index',
        path: '/api/{version}/books',
        description: 'Lists all books along with their chapter counts.',
        exampleRequest: '/api/KJV/books',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          count: 66,
          books: [
            { name: 'Genesis', chapters: 50 },
            { name: 'Exodus', chapters: 40 },
            { name: 'Leviticus', chapters: 27 },
          ],
        },
      },
      {
        id: 'summary',
        title: 'Translation Summary',
        path: '/api/{version}/summary',
        description: 'Returns per-book verse totals and chapter summaries for an entire translation.',
        exampleRequest: '/api/KJV/summary',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          name: 'King James Version',
          books: [
            {
              name: 'Genesis',
              chapters: 50,
              verses: 1533,
              chapterSummary: [
                { chapter: '1', verses: 31 },
                { chapter: '2', verses: 25 },
              ],
            },
          ],
        },
        notes: ['Useful when building local indexes, navigation sidebars, or static site maps.'],
      },
      {
        id: 'summary-book',
        title: 'Book Summary',
        path: '/api/{version}/summary/{book}',
        description: 'Returns total chapter and verse counts for one book.',
        exampleRequest: '/api/KJV/summary/Genesis',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'book', location: 'path', required: true, description: 'Book name, case-insensitive.' },
        ],
        response: {
          version: 'KJV',
          book: 'Genesis',
          chapters: 50,
          totalVerses: 1533,
          chapterSummary: [
            { chapter: '1', verses: 31 },
            { chapter: '2', verses: 25 },
          ],
        },
      },
      {
        id: 'summary-chapter',
        title: 'Chapter Summary',
        path: '/api/{version}/summary/{book}/{chapter}',
        description: 'Returns the verse count for one specific chapter.',
        exampleRequest: '/api/KJV/summary/Genesis/1',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'book', location: 'path', required: true, description: 'Book name, case-insensitive.' },
          { name: 'chapter', location: 'path', required: true, description: 'Chapter number as a path segment.' },
        ],
        response: {
          version: 'KJV',
          book: 'Genesis',
          chapter: 1,
          verses: 31,
        },
      },
    ],
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Direct scripture retrieval, from whole-book structure down to individual verses.',
    endpoints: [
      {
        id: 'book',
        title: 'Book Overview',
        path: '/api/{version}/book?name=Genesis',
        description: 'Returns one book plus chapter-level verse counts.',
        exampleRequest: '/api/KJV/book?name=Genesis',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'name', location: 'query', required: true, description: 'Book name, case-insensitive and whitespace-tolerant.' },
        ],
        response: {
          version: 'KJV',
          book: 'Genesis',
          chapterCount: 50,
          chapters: [
            { chapter: 1, verseCount: 31 },
            { chapter: 2, verseCount: 25 },
          ],
        },
      },
      {
        id: 'chapter',
        title: 'Chapter',
        path: '/api/{version}/chapter?book=John&chapter=3',
        description: 'Returns every verse in one chapter.',
        exampleRequest: '/api/KJV/chapter?book=John&chapter=3',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'book', location: 'query', required: true, description: 'Book name.' },
          { name: 'chapter', location: 'query', required: true, description: 'Chapter number.' },
        ],
        response: {
          version: 'KJV',
          book: 'John',
          chapter: 3,
          verseCount: 36,
          verses: [
            { verse: 16, text: 'For God so loved the world...' },
            { verse: 17, text: 'For God sent not his Son...' },
          ],
        },
      },
      {
        id: 'verse',
        title: 'Verse',
        path: '/api/{version}/verse?book=John&chapter=3&verse=16',
        description: 'Returns a single verse payload with normalized numeric chapter and verse values.',
        exampleRequest: '/api/KJV/verse?book=John&chapter=3&verse=16',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'book', location: 'query', required: true, description: 'Book name.' },
          { name: 'chapter', location: 'query', required: true, description: 'Chapter number.' },
          { name: 'verse', location: 'query', required: true, description: 'Verse number.' },
        ],
        response: {
          version: 'KJV',
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world...',
        },
      },
      {
        id: 'passage',
        title: 'Passage Range',
        path: '/api/{version}/passage?book=John&chapter=3&start=16&end=18',
        description: 'Returns a contiguous verse range inside one chapter.',
        exampleRequest: '/api/KJV/passage?book=John&chapter=3&start=16&end=18',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'book', location: 'query', required: true, description: 'Book name.' },
          { name: 'chapter', location: 'query', required: true, description: 'Positive chapter number.' },
          { name: 'start', location: 'query', required: true, description: 'First verse in the inclusive range.' },
          { name: 'end', location: 'query', required: true, description: 'Last verse in the inclusive range.' },
        ],
        response: {
          version: 'KJV',
          book: 'John',
          chapter: 3,
          range: { start: 16, end: 18 },
          verseCount: 3,
          verses: [
            { verse: 16, text: 'For God so loved the world...' },
            { verse: 17, text: 'For God sent not his Son...' },
            { verse: 18, text: 'He that believeth on him...' },
          ],
        },
      },
      {
        id: 'reference',
        title: 'Reference Parser',
        path: '/api/{version}/ref/1%20Corinthians%2013%3A4-7',
        description: 'Parses human-readable references, including multi-word book names and cross-chapter ranges.',
        exampleRequest: '/api/KJV/ref/1%20Corinthians%2013%3A4-7',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'reference', location: 'path', required: true, description: 'URL-encoded reference string such as John 3:16-18 or Genesis 1:31-2:3.' },
        ],
        response: {
          version: 'KJV',
          book: '1 Corinthians',
          start: { chapter: 13, verse: 4 },
          end: { chapter: 13, verse: 7 },
          verseCount: 4,
          verses: [
            { chapter: 13, verse: 4, text: 'Charity suffereth long...' },
            { chapter: 13, verse: 5, text: 'Doth not behave itself unseemly...' },
          ],
        },
      },
    ],
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Search, topic lookup, daily picks, and uniform random verse selection.',
    endpoints: [
      {
        id: 'search',
        title: 'Full-Text Search',
        path: '/api/{version}/search?q=faith&limit=10&offset=0',
        description: 'Searches verse text and returns paginated results.',
        exampleRequest: '/api/KJV/search?q=faith&limit=10&offset=0',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'q', location: 'query', required: true, description: 'Case-insensitive search text.' },
          { name: 'limit', location: 'query', required: false, description: 'Maximum result count from 1 to 100. Defaults to 25.' },
          { name: 'offset', location: 'query', required: false, description: 'Zero-based result offset. Defaults to 0.' },
        ],
        response: {
          version: 'KJV',
          query: 'faith',
          offset: 0,
          limit: 10,
          returned: 10,
          totalMatches: 247,
          hasMore: true,
          results: [
            { book: 'Romans', chapter: 10, verse: 17, text: 'So then faith cometh by hearing...' },
            { book: 'Hebrews', chapter: 11, verse: 1, text: 'Now faith is the substance...' },
          ],
        },
        notes: ['Pagination metadata reflects the entire match set, not just the current page.'],
      },
      {
        id: 'topic',
        title: 'Topic Lookup',
        path: '/api/{version}/topic/faith',
        description: 'Returns verses for a curated keyword when that keyword exists in the internal topic index.',
        exampleRequest: '/api/KJV/topic/faith',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'keyword', location: 'path', required: true, description: 'Curated keyword such as faith, love, or hope.' },
        ],
        response: {
          version: 'KJV',
          topic: 'faith',
          count: 3,
          results: [
            { book: 'Hebrews', chapter: 11, verse: 1, text: 'Now faith is the substance...' },
            { book: 'Romans', chapter: 10, verse: 17, text: 'So then faith cometh by hearing...' },
          ],
        },
        notes: ['Unknown topics return an empty `results` array with a helpful `message` field.'],
      },
      {
        id: 'daily',
        title: 'Verse of the Day',
        path: '/api/{version}/daily',
        description: 'Returns a deterministic verse for the current UTC date.',
        exampleRequest: '/api/KJV/daily',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          date: '2026-08-14',
          book: 'Psalms',
          chapter: 119,
          verse: 105,
          text: 'Thy word is a lamp unto my feet...',
        },
      },
      {
        id: 'random',
        title: 'Random Verse',
        path: '/api/{version}/random',
        description: 'Returns a uniformly random verse from the full translation.',
        exampleRequest: '/api/KJV/random',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          book: 'Proverbs',
          chapter: 3,
          verse: 5,
          text: 'Trust in the LORD with all thine heart...',
        },
      },
      {
        id: 'random-book',
        title: 'Random Verse From One Book',
        path: '/api/{version}/random/Genesis',
        description: 'Returns a uniformly random verse from a specific book.',
        exampleRequest: '/api/KJV/random/Genesis',
        params: [
          { name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' },
          { name: 'book', location: 'path', required: true, description: 'Book name path segment.' },
        ],
        response: {
          version: 'KJV',
          book: 'Genesis',
          chapter: 15,
          verse: 6,
          text: 'And he believed in the LORD...',
        },
      },
      {
        id: 'random-old',
        title: 'Random Old Testament Verse',
        path: '/api/{version}/random/old-testament',
        description: 'Returns a uniformly random verse from the canonical Old Testament subset.',
        exampleRequest: '/api/KJV/random/old-testament',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          testament: 'Old',
          book: 'Isaiah',
          chapter: 41,
          verse: 10,
          text: 'Fear thou not; for I am with thee...',
        },
      },
      {
        id: 'random-new',
        title: 'Random New Testament Verse',
        path: '/api/{version}/random/new-testament',
        description: 'Returns a uniformly random verse from the canonical New Testament subset.',
        exampleRequest: '/api/KJV/random/new-testament',
        params: [{ name: 'version', location: 'path', required: true, description: 'Canonical id or registered alias.' }],
        response: {
          version: 'KJV',
          testament: 'New',
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world...',
        },
      },
    ],
  },
];

function renderMethodBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-700">
      GET
    </span>
  );
}

function responseToString(response: unknown) {
  return JSON.stringify(response, null, 2);
}

export default async function HomePage() {
  const versions = await getAvailableVersions();
  const defaultVersion = versions[0]?.id ?? 'KJV';

  const quickFacts = [
    {
      title: 'JSON responses',
      body: 'Every documented route returns JSON, and most errors use a small `{ error: string }` payload.',
    },
    {
      title: 'Alias support',
      body: 'Registered aliases such as `KJbible` resolve to canonical ids like `KJV` before data is loaded.',
    },
    {
      title: 'Search pagination',
      body: 'Search exposes `limit`, `offset`, `returned`, `totalMatches`, and `hasMore` for predictable pagination.',
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.18),_transparent_32%),linear-gradient(180deg,#fffaf2_0%,#fffdf8_42%,#f8fbff_100%)] text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:gap-14 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:items-end">
          <div className="space-y-5 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-amber-950/5 backdrop-blur sm:p-8">
            <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800 sm:text-sm">
              Public-domain scripture API
            </p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Scripture API
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                Public-domain Bible API with version-aware routes for metadata, reading, summaries, search,
                topic lookup, daily verses, and random selection.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <code className="overflow-x-auto rounded-[1.4rem] border border-slate-300 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-lg shadow-slate-950/10">
                GET /api/{defaultVersion}/verse?book=John&amp;chapter=3&amp;verse=16
              </code>
              <code className="overflow-x-auto rounded-[1.4rem] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                GET /api/{defaultVersion}/search?q=grace&amp;limit=10&amp;offset=0
              </code>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-xl shadow-amber-950/5 backdrop-blur sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Available versions</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {versions.length} listed
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm"
                >
                  <div className="text-base font-semibold text-slate-900">{version.id}</div>
                  <div className="text-sm text-slate-600">{version.name}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-700">
                    {version.language}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              The route examples use <code className="rounded bg-slate-100 px-1.5 py-0.5">{defaultVersion}</code>,
              but aliases such as <code className="rounded bg-slate-100 px-1.5 py-0.5">KJbible</code> are normalized
              before lookup.
            </p>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {quickFacts.map((fact) => (
            <article
              key={fact.title}
              className="rounded-[1.7rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6"
            >
              <h2 className="text-lg font-semibold">{fact.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{fact.body}</p>
            </article>
          ))}
        </section>

        <section className="sticky top-0 z-10 -mx-4 border-y border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">
            {endpointGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
              >
                {group.title}
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Endpoint Reference</h2>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            Every card below shows the route pattern, required inputs, an example request when parameters are
            involved, and the expected response shape. Examples are compact, but the field names match the
            implementation.
          </p>
        </section>

        <div className="space-y-10">
          {endpointGroups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className="scroll-mt-24 rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-7"
            >
              <div className="max-w-3xl space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{group.title}</h3>
                <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{group.description}</p>
              </div>

              <div className="mt-6 space-y-5">
                {group.endpoints.map((endpoint) => (
                  <article
                    key={endpoint.id}
                    className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-slate-50/70 shadow-sm"
                  >
                    <div className="border-b border-slate-200 bg-white/75 px-5 py-4 sm:px-6">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderMethodBadge()}
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {endpoint.title}
                            </span>
                          </div>
                          <code className="block overflow-x-auto text-sm font-semibold text-slate-900 sm:text-base">
                            {endpoint.path.replaceAll('{version}', defaultVersion)}
                          </code>
                        </div>
                        {endpoint.params && endpoint.params.length > 0 ? (
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                            {endpoint.params.length} parameter{endpoint.params.length > 1 ? 's' : ''}
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                        {endpoint.description}
                      </p>
                    </div>

                    <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.95fr)]">
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Parameters
                          </h4>
                          {endpoint.params && endpoint.params.length > 0 ? (
                            <div className="space-y-3">
                              {endpoint.params.map((param) => (
                                <div
                                  key={`${endpoint.id}-${param.location}-${param.name}`}
                                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <code className="text-sm font-semibold text-slate-900">{param.name}</code>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                      {param.location}
                                    </span>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                                        param.required
                                          ? 'bg-rose-50 text-rose-700'
                                          : 'bg-emerald-50 text-emerald-700'
                                      }`}
                                    >
                                      {param.required ? 'required' : 'optional'}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">{param.description}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                              No path or query parameters are required for this route.
                            </div>
                          )}
                        </div>

                        {endpoint.exampleRequest ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Example Request
                            </h4>
                            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                              <code className="block overflow-x-auto text-sm font-semibold text-slate-900">
                                GET {endpoint.exampleRequest.replaceAll('{version}', defaultVersion)}
                              </code>
                            </div>
                          </div>
                        ) : null}

                        {endpoint.notes && endpoint.notes.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Notes
                            </h4>
                            <div className="space-y-2">
                              {endpoint.notes.map((note) => (
                                <p
                                  key={`${endpoint.id}-${note}`}
                                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                                >
                                  {note}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Example Response
                        </h4>
                        <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 shadow-inner">
                          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                            <span className="h-3 w-3 rounded-full bg-rose-400" />
                            <span className="h-3 w-3 rounded-full bg-amber-400" />
                            <span className="h-3 w-3 rounded-full bg-emerald-400" />
                          </div>
                          <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6 text-slate-100 sm:px-5 sm:text-sm">
                            <code>{responseToString(endpoint.response)}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
