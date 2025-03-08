import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Check if user is authenticated by looking for the token in cookies
  const token = request.cookies.get('token')?.value;
  
  // If accessing dashboard routes and no token exists, redirect to login
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // If accessing admin login page and token exists, redirect to dashboard
  if (path === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/login'
  ]
}; 