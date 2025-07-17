import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { applySecurityHeaders, applyCorsHeaders, logSecurityEvent } from '@/lib/security-headers'

// Protected routes that require authentication
const protectedRoutes = [
  '/',
  '/dashboard',
  '/videos',
  '/categories',
  '/slider',
  '/notifications',
  '/notification-history',
  '/pages',
  '/reports',
  '/settings',
  '/slider-management'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')
  
  console.log('🔍 Middleware checking path:', pathname)

  // Create base response
  let response: NextResponse

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    response = NextResponse.next()
    // Apply security headers to all responses
    applySecurityHeaders(response)
    applyCorsHeaders(response, origin || undefined)
    return response
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    console.log('✅ Public route, allowing access')
    response = NextResponse.next()
    applySecurityHeaders(response)
    applyCorsHeaders(response, origin || undefined)
    return response
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isProtectedRoute) {
    console.log('✅ Non-protected route, allowing access')
    response = NextResponse.next()
    applySecurityHeaders(response)
    applyCorsHeaders(response, origin || undefined)
    return response
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    console.log('❌ No token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT token
    const payload = verifyToken(token)
    console.log('✅ Token valid for user:', payload.username)

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-username', payload.username)
    requestHeaders.set('x-user-role', payload.role)

    response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })

    // Apply security headers to authenticated responses
    applySecurityHeaders(response)
    applyCorsHeaders(response, origin || undefined)
    
    return response

  } catch (error) {
    console.log('❌ Token verification failed:', error)
    
    // Clear invalid token cookie
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
