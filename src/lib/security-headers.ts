import { NextResponse } from 'next/server'

// Security headers configuration
export const SECURITY_HEADERS = {
  // Content Security Policy - Enhanced XSS and code injection protection
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-{NONCE}'", // Next.js requirements with nonce
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind and Google Fonts
    "img-src 'self' data: https: blob:", // Image uploads
    "font-src 'self' data: https://fonts.gstatic.com", // Font sources
    "connect-src 'self' https://api.supabase.co https://*.supabase.co https://api.upstash.com", // APIs
    "media-src 'self' https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'", // Clickjacking protection
    "frame-src 'none'", // Prevent iframe embedding
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; '),

  // Clickjacking koruması
  'X-Frame-Options': 'DENY',

  // MIME type sniffing koruması
  'X-Content-Type-Options': 'nosniff',

  // XSS koruması (modern tarayıcılar için)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // HTTPS zorunluluğu (production'da)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', ')
}

// CORS configuration
export const CORS_CONFIG = {
  // Allowed origins (production'da kısıtlanmalı)
  allowedOrigins: process.env.NODE_ENV === 'production' 
    ? [
        'https://businesstime-admin.vercel.app',
        'https://businesstime.com',
        'https://www.businesstime.com'
      ]
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.64:3000' // Local network access
      ],

  // Allowed methods
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],

  // Credentials support
  credentials: true,

  // Preflight cache time
  maxAge: 86400 // 24 hours
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Remove server information
  response.headers.delete('Server')
  response.headers.delete('X-Powered-By')

  return response
}

// Apply CORS headers to response
export function applyCorsHeaders(
  response: NextResponse, 
  origin?: string
): NextResponse {
  // Check if origin is allowed
  const isAllowedOrigin = !origin || 
    CORS_CONFIG.allowedOrigins.includes(origin) ||
    (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost'))

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  response.headers.set(
    'Access-Control-Allow-Methods', 
    CORS_CONFIG.allowedMethods.join(', ')
  )
  
  response.headers.set(
    'Access-Control-Allow-Headers', 
    CORS_CONFIG.allowedHeaders.join(', ')
  )
  
  response.headers.set(
    'Access-Control-Max-Age', 
    CORS_CONFIG.maxAge.toString()
  )

  return response
}

// Create secure API response
export function createSecureApiResponse(
  data: any, 
  status: number = 200,
  origin?: string
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  // Apply security headers
  applySecurityHeaders(response)
  
  // Apply CORS headers
  applyCorsHeaders(response, origin)
  
  return response
}

// Handle preflight OPTIONS requests
export function handlePreflightRequest(origin?: string): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  
  // Apply CORS headers for preflight
  applyCorsHeaders(response, origin)
  
  return response
}

// Rate limiting headers
export function applyRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: Date
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(reset.getTime() / 1000).toString())
  
  return response
}

// Security event logging
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    severity,
    details,
    environment: process.env.NODE_ENV
  }

  // Console logging (development)
  if (process.env.NODE_ENV === 'development') {
    const emoji = {
      low: '🔵',
      medium: '🟡', 
      high: '🟠',
      critical: '🔴'
    }[severity]

    console.log(`${emoji} [SECURITY] ${event}:`, {
      event,
      ...details,
      timestamp
    });
  }

  // Production'da external logging service'e gönderilebilir
  // örn: Sentry, LogRocket, DataDog vb.
}

// Validate request origin
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow same-origin requests
  if (!origin && !referer) {
    return true // Direct API calls
  }

  // Check origin
  if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
    return true
  }

  // Check referer as fallback
  if (referer) {
    const refererOrigin = new URL(referer).origin
    if (CORS_CONFIG.allowedOrigins.includes(refererOrigin)) {
      return true
    }
  }

  return false
}

// Content type validation
export function validateContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return false
  }

  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
  ]

  return allowedTypes.some(type => contentType.includes(type))
}

// Request size validation
export function validateRequestSize(request: Request): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (!contentLength) {
    return true // No content length header
  }

  const maxSize = 10 * 1024 * 1024 // 10MB limit
  return parseInt(contentLength) <= maxSize
}

// Security middleware helper
export function createSecurityMiddleware() {
  return {
    validateOrigin: validateRequestOrigin,
    validateContentType,
    validateRequestSize,
    applyHeaders: applySecurityHeaders,
    applyCors: applyCorsHeaders,
    logEvent: logSecurityEvent,
    createResponse: createSecureApiResponse,
    handlePreflight: handlePreflightRequest
  }
}

// Export types for TypeScript
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical'
export type SecurityEvent = {
  timestamp: string
  event: string
  severity: SecurityEventSeverity
  details: Record<string, any>
  environment: string
}
