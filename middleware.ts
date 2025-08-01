
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the login page itself
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // Protect all other admin routes
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin-auth');
    if (!authCookie || authCookie.value !== 'true') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname); // Optional: redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /admin to /admin/dashboard for convenience.
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for API routes, static files, and image optimization files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
