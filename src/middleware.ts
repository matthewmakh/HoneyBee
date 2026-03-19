import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isAuthRoute = pathname.startsWith('/api/auth') || pathname.startsWith('/api/uploadthing');

  // Allow auth API routes
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users from protected routes
  if (!session?.user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from login/register to dashboard
  if (session?.user && (pathname === '/login' || pathname === '/register')) {
    if (session.user.role === 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check admin routes access
  if (pathname.startsWith('/admin') && session?.user?.role !== 'SUPERADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check if company is suspended
  if (session?.user?.company?.isSuspended && session.user.role !== 'SUPERADMIN') {
    if (pathname !== '/suspended') {
      return NextResponse.redirect(new URL('/suspended', request.url));
    }
  }

  // Handle users with pending-only provider application (no portal access yet)
  if (session?.user && session.user.role !== 'SUPERADMIN') {
    const { canUseReferrerPortal, canUseProviderPortal, providerApplicationPending } = session.user.company;
    const hasNoPortalAccess = !canUseReferrerPortal && !canUseProviderPortal;

    if (hasNoPortalAccess && providerApplicationPending) {
      // Only allow pending-approval page and sign out
      if (pathname !== '/pending-approval') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
    }
  }

  // Check portal access for dashboard routes
  if (pathname.startsWith('/dashboard') && session?.user) {
    const { canUseReferrerPortal, canUseProviderPortal } = session.user.company;

    // Check referrer routes
    if (pathname.startsWith('/dashboard/referrer') && !canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check provider routes
    if (pathname.startsWith('/dashboard/provider') && !canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
