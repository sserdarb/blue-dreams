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

  // Skip static files and ALL API routes from locale redirect
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle ALL API routes BEFORE locale logic — API routes never get locale prefix
  if (pathname.startsWith('/api')) {
    // Admin API auth check
    if (pathname.startsWith('/api/admin')) {
      // OAuth callback'leri Google'dan session cookie olmadan gelir
      if (pathname.startsWith('/api/admin/ads/oauth/callback')) {
        return NextResponse.next();
      }
      // Seed content endpoint uses its own secret token auth
      if (pathname.startsWith('/api/admin/seed-content')) {
        return NextResponse.next();
      }
      // Seed pages endpoint
      if (pathname.startsWith('/api/admin/seed-pages')) {
        return NextResponse.next();
      }
      const authCookie = request.cookies.get('admin_session');
      if (!authCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPath(pathname);

  // Route translation map
  const routeMap: Record<string, string> = {
    '/en/reservation': '/en/rezervasyon',
    '/de/reservierung': '/de/rezervasyon',
    '/ru/bronirovanie': '/ru/rezervasyon',
    '/en/rooms': '/en/odalar',
    '/de/zimmer': '/de/odalar',
    '/ru/nomera': '/ru/odalar',
    '/en/contact': '/en/iletisim',
    '/de/kontakt': '/de/iletisim',
    '/ru/kontakty': '/ru/iletisim',
    '/en/about-us': '/en/hakkimizda',
    '/de/uber-uns': '/de/hakkimizda',
    '/ru/o-nas': '/ru/hakkimizda',
    '/en/kids-club': '/en/cocuk-kulubu',
    '/de/kinderclub': '/de/cocuk-kulubu',
    '/ru/detskiy-klub': '/ru/cocuk-kulubu',
    '/en/gallery': '/en/galeri',
    '/de/galerie': '/de/galeri',
    '/ru/galereya': '/ru/galeri',
    '/en/restaurants': '/en/restoran',
    '/de/restaurants': '/de/restoran',
    '/ru/restorany': '/ru/restorany', // Actually it maps to /ru/restoran
  };

  // If no locale in path, redirect to preferred locale
  if (!pathnameLocale) {
    const preferredLocale = getPreferredLocale(request);
    const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', preferredLocale, { maxAge: 60 * 60 * 24 * 365 });
    return addSecurityHeaders(response);
  }

  // Handle translated route rewrites
  if (routeMap[pathname]) {
    const rewriteUrl = new URL(routeMap[pathname], request.url);
    return addSecurityHeaders(NextResponse.rewrite(rewriteUrl));
  }

  // Specific fix for '/ru/restorany' mapping mapping
  if (pathname === '/ru/restorany') {
    return addSecurityHeaders(NextResponse.rewrite(new URL('/ru/restoran', request.url)));
  }

  // Admin page protection (not API — already handled above)
  const isAdminPage = /^\/[a-z]{2}\/admin/.test(pathname);

  if (isAdminPage) {
    // Public admin routes (login)
    if (pathname.includes('/login')) {
      return addSecurityHeaders(NextResponse.next());
    }

    const authCookie = request.cookies.get('admin_session');

    if (!authCookie) {
      const loginUrl = new URL(`/${pathnameLocale || defaultLocale}/admin/login`, request.url);
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

