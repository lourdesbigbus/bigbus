import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-token';

export async function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('hubly_admin_auth');
  const token = authCookie?.value;
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'hublypro123';
  let isAuthenticated = false;
  
  if (token) {
    const payload = await verifyToken(token, adminPassword);
    if (payload && payload.role === 'admin') {
      isAuthenticated = true;
    }
  }

  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('hubly_admin_auth');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
