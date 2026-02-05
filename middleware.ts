import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['tr', 'en', 'de', 'ru'];
const defaultLocale = 'tr';

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/');
  if (segments.length > 1 && locales.includes(segments[1])) {
    return segments[1];
  }
  return null;
}

function getPreferredLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => {
      const [code] = lang.trim().split(';');
      return code.split('-')[0].toLowerCase();
    });

    for (const lang of languages) {
      if (locales.includes(lang)) {
        return lang;
      }
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPath(pathname);

  // If no locale in path, redirect to preferred locale
  if (!pathnameLocale) {
    const preferredLocale = getPreferredLocale(request);
    const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', preferredLocale, { maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  // Admin route protection
  const adminRegex = /^\/[a-z]{2}\/admin/;
  if (adminRegex.test(pathname)) {
    if (pathname.includes('/login')) {
      return addSecurityHeaders(NextResponse.next());
    }

    const authCookie = request.cookies.get('admin_session');
    if (!authCookie) {
      const loginUrl = new URL(`/${pathnameLocale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

