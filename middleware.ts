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
  '/api/auth/logout',
  '/api/public/videos',
  '/api/public/categories',
  '/api/public/settings',
  '/api/public/featured-content',
  '/api/compliance/gdpr-consent'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  console.log('🔍 Middleware checking path:', pathname)

  // Security validations
  // 1. Block suspicious user agents
  const suspiciousAgents = ['sqlmap', 'nikto', 'nessus', 'nmap', 'masscan']
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    logSecurityEvent('suspicious_user_agent', { userAgent, ip, pathname }, 'high')
    return new NextResponse('Access Denied', { status: 403 })
  }

  // 2. Block requests with suspicious paths
  const suspiciousPaths = [
    '/wp-admin', '/admin.php', '/.env', '/config.php', '/phpinfo.php',
    '/wp-config.php', '/backup.sql', '/database.sql', '/.git/'
  ]
  if (suspiciousPaths.some(path => pathname.includes(path))) {
    logSecurityEvent('suspicious_path_access', { pathname, ip, userAgent }, 'high')
    return new NextResponse('Not Found', { status: 404 })
  }

  // 3. Validate content length for non-GET requests
  if (request.method !== 'GET') {
    const contentLength = request.headers.get('content-length')
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (contentLength && parseInt(contentLength) > maxSize) {
      logSecurityEvent('large_request_blocked', { size: contentLength, ip, pathname }, 'medium')
      return new NextResponse('Request too large', { status: 413 })
    }
  }

  // Create base response
  let response: NextResponse

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api/public') ||
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
