import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is an admin route
  // The pattern matches /en/admin, /tr/admin, etc.
  const adminRegex = /^\/[a-z]{2}\/admin/;

  if (adminRegex.test(path)) {
    // allow access to login page
    if (path.includes('/login')) {
      return NextResponse.next();
    }

    // Check for auth cookie
    const authCookie = request.cookies.get('admin_session');

    if (!authCookie) {
      // Get the locale from the path to redirect correctly
      const locale = path.split('/')[1];
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths starting with /:locale/admin
    '/:path*/admin/:path*',
  ],
};
