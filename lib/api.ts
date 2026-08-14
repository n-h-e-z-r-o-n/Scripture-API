import { NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/bibleUtils';

export function withApiHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers(corsHeaders);

  if (headers) {
    const incoming = new Headers(headers);
    incoming.forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return merged;
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: withApiHeaders(init?.headers),
  });
}

export function errorResponse(
  status: number,
  message: string,
  extra?: Record<string, unknown>,
  init?: ResponseInit
) {
  return jsonResponse(
    {
      error: message,
      ...extra,
    },
    {
      ...init,
      status,
    }
  );
}

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: withApiHeaders(),
  });
}

export function cacheControl(seconds: number) {
  return {
    'Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`,
  };
}
