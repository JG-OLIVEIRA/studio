
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin') {
    const session = await verifySession();
    
    // If there's no active session, redirect to the login page
    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  // Redirect /admin to /admin/login
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }


  return NextResponse.next();
}

export const config = {
  // Match all routes except for API routes, static files, and image optimization files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
