import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEFAULT_CITY = 'msk';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);

  // если город уже есть — ок
  if (segments.length > 0) return NextResponse.next();

  const city =
    request.cookies.get('citySlug')?.value || DEFAULT_CITY;

  const url = request.nextUrl.clone();
  url.pathname = `/${city}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
