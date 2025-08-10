import { NextRequest, NextResponse } from 'next/server'
import { InputSanitizer } from './input-sanitizer'
import { logSecurityEvent } from './security-headers'
import { verifyToken } from './jwt'

/**
 * API Security middleware and utilities
 */
export class ApiSecurity {
  
  /**
   * Rate limiting storage (in production use Redis/database)
   */
  private static rateLimitStore: Map<string, { count: number, resetTime: number }> = new Map()

  /**
   * Validate API request security
   */
  static async validateRequest(request: NextRequest): Promise<{
    isValid: boolean
    errors: string[]
    sanitizedData?: any
  }> {
    const errors: string[] = []
    let sanitizedData: any = null

    // 1. Validate request method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    if (!allowedMethods.includes(request.method)) {
      errors.push('Invalid HTTP method')
    }

    // 2. Validate content type for non-GET requests
    if (!['GET', 'OPTIONS'].includes(request.method)) {
      const contentType = request.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        errors.push('Invalid content type')
      }
    }

    // 3. Validate request size
    const contentLength = request.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (size > maxSize) {
        errors.push('Request too large')
      }
    }

    // 4. Validate and sanitize request body
    if (!['GET', 'OPTIONS'].includes(request.method)) {
      try {
        const body = await request.json()
        sanitizedData = this.sanitizeRequestData(body)
        
        // Check for malicious patterns
        const threats = this.detectThreats(JSON.stringify(body))
        if (threats.length > 0) {
          errors.push(`Security threats detected: ${threats.join(', ')}`)
          
          logSecurityEvent('api_security_threat', {
            threats,
            endpoint: request.nextUrl.pathname,
            method: request.method,
            ip: request.ip || 'unknown'
          }, 'high')
        }
      } catch (error) {
        errors.push('Invalid JSON body')
      }
    }

    // 5. Validate headers
    const userAgent = request.headers.get('user-agent')
    if (!userAgent || this.isSuspiciousUserAgent(userAgent)) {
      errors.push('Invalid or suspicious user agent')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Sanitize request data recursively
   */
  static sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return InputSanitizer.sanitizeText(data)
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item))
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = InputSanitizer.sanitizeText(key)
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.sanitizeRequestData(value)
        }
      }
      return sanitized
    }
    
    return data
  }

  /**
   * Detect security threats in data
   */
  static detectThreats(data: string): string[] {
    const threats: string[] = []
    
    if (InputSanitizer.containsSqlInjection(data)) {
      threats.push('SQL Injection')
    }
    
    if (InputSanitizer.containsXSS(data)) {
      threats.push('XSS')
    }
    
    // Check for command injection
    const cmdPatterns = [
      /\$\(.*\)/, // Command substitution
      /`.*`/, // Backticks
      /\|.*[;&]/, // Pipes and command separators
      /\bwget\b|\bcurl\b|\bfetch\b/i, // Download commands
      /\brm\b|\bdel\b|\bunlink\b/i, // Delete commands
    ]
    
    if (cmdPatterns.some(pattern => pattern.test(data))) {
      threats.push('Command Injection')
    }
    
    // Check for path traversal
    if (/\.\.\/|\.\.\\|\.\.[\/\\]/.test(data)) {
      threats.push('Path Traversal')
    }
    
    return threats
  }

  /**
   * Check for suspicious user agents
   */
  static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /burpsuite/i,
      /owasp/i,
      /python-requests/i,
      /curl/i,
      /wget/i,
      /scanner/i,
      /bot.*hack/i,
      /attack/i
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent))
  }

  /**
   * Enhanced rate limiting
   */
  static checkRateLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 900000 // 15 minutes
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean expired entries
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (value.resetTime < now) {
        this.rateLimitStore.delete(key)
      }
    }
    
    let record = this.rateLimitStore.get(identifier)
    
    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + windowMs
      }
      this.rateLimitStore.set(identifier, record)
    }
    
    const allowed = record.count < limit
    const remaining = Math.max(0, limit - record.count - 1)
    
    if (allowed) {
      record.count++
    }
    
    return {
      allowed,
      remaining,
      resetTime: record.resetTime
    }
  }

  /**
   * Verify API authentication
   */
  static async verifyAuth(request: NextRequest): Promise<{
    isValid: boolean
    user?: any
    error?: string
  }> {
    // Get token from Authorization header or cookie
    let token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      token = request.cookies.get('auth-token')?.value
    }
    
    if (!token) {
      return { isValid: false, error: 'No authentication token provided' }
    }
    
    try {
      const payload = verifyToken(token)
      return { isValid: true, user: payload }
    } catch (error) {
      return { isValid: false, error: 'Invalid authentication token' }
    }
  }

  /**
   * Create secure API response with proper headers
   */
  static createSecureResponse(data: any, status: number = 200): NextResponse {
    const response = NextResponse.json(data, { status })
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Cache control for sensitive data
    if (status === 200 && data?.success === false) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    }
    
    return response
  }

  /**
   * Log API access for security monitoring
   */
  static logApiAccess(
    request: NextRequest,
    response: { status: number },
    user?: any,
    duration?: number
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.nextUrl.pathname,
      status: response.status,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      user: user?.username || 'anonymous',
      duration: duration || 0
    }
    
    // Log suspicious activities
    if (response.status >= 400 || response.status === 401 || response.status === 403) {
      const severity = response.status >= 500 ? 'high' : 'medium'
      logSecurityEvent('api_error', logEntry, severity)
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 API Access:', logEntry)
    }
  }

  /**
   * Middleware wrapper for API routes
   */
  static withSecurity(handler: Function, options: {
    requireAuth?: boolean
    rateLimit?: { limit: number, windowMs: number }
    allowedMethods?: string[]
  } = {}) {
    return async (request: NextRequest, ...args: any[]) => {
      const startTime = Date.now()
      
      try {
        // Method validation
        if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
          return this.createSecureResponse(
            { success: false, message: 'Method not allowed' },
            405
          )
        }
        
        // Rate limiting
        if (options.rateLimit) {
          const identifier = request.ip || 'unknown'
          const rateCheck = this.checkRateLimit(
            identifier,
            options.rateLimit.limit,
            options.rateLimit.windowMs
          )
          
          if (!rateCheck.allowed) {
            logSecurityEvent('rate_limit_exceeded', {
              ip: identifier,
              path: request.nextUrl.pathname
            }, 'medium')
            
            const response = this.createSecureResponse(
              { success: false, message: 'Rate limit exceeded' },
              429
            )
            response.headers.set('Retry-After', Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString())
            return response
          }
        }
        
        // Request validation
        const validation = await this.validateRequest(request)
        if (!validation.isValid) {
          return this.createSecureResponse(
            { success: false, message: 'Invalid request', errors: validation.errors },
            400
          )
        }
        
        // Authentication check
        let user = null
        if (options.requireAuth) {
          const auth = await this.verifyAuth(request)
          if (!auth.isValid) {
            return this.createSecureResponse(
              { success: false, message: auth.error || 'Authentication required' },
              401
            )
          }
          user = auth.user
        }
        
        // Execute handler
        const result = await handler(request, ...args, { user, sanitizedData: validation.sanitizedData })
        
        // Log access
        const duration = Date.now() - startTime
        this.logApiAccess(request, { status: result.status || 200 }, user, duration)
        
        return result
        
      } catch (error) {
        const duration = Date.now() - startTime
        
        console.error('API Error:', error)
        logSecurityEvent('api_internal_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: request.nextUrl.pathname,
          method: request.method
        }, 'high')
        
        this.logApiAccess(request, { status: 500 }, null, duration)
        
        return this.createSecureResponse(
          { success: false, message: 'Internal server error' },
          500
        )
      }
    }
  }
}