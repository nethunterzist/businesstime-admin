import { NextRequest } from 'next/server'
import crypto from 'crypto'

// CSRF token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_LIFETIME = 3600 * 1000 // 1 hour in milliseconds
  
  /**
   * Generate a secure CSRF token
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Create a signed CSRF token with timestamp
   */
  static createSignedToken(secret: string): string {
    const timestamp = Date.now().toString()
    const token = this.generateToken()
    const payload = `${timestamp}:${token}`
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return `${timestamp}:${token}:${signature}`
  }

  /**
   * Validate CSRF token
   */
  static validateToken(signedToken: string, secret: string): boolean {
    try {
      const [timestamp, token, signature] = signedToken.split(':')
      
      if (!timestamp || !token || !signature) {
        return false
      }

      // Check token age
      const tokenTime = parseInt(timestamp)
      if (Date.now() - tokenTime > this.TOKEN_LIFETIME) {
        return false
      }

      // Verify signature
      const payload = `${timestamp}:${token}`
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    } catch {
      return false
    }
  }

  /**
   * Validate CSRF token from request
   */
  static validateRequestToken(request: NextRequest, secret: string): boolean {
    // Check for token in header or body
    const headerToken = request.headers.get('X-CSRF-Token')
    const bodyToken = request.headers.get('X-Requested-With') === 'XMLHttpRequest'
      
    const token = headerToken
    if (!token) {
      return false
    }

    return this.validateToken(token, secret)
  }

  /**
   * Check if request needs CSRF validation
   */
  static shouldValidate(request: NextRequest): boolean {
    const method = request.method?.toLowerCase()
    const safeMethods = ['get', 'head', 'options', 'trace']
    
    return !safeMethods.includes(method)
  }
}

/**
 * CSRF middleware function
 */
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Skip CSRF for safe methods
    if (!CSRFProtection.shouldValidate(request)) {
      return handler(request, ...args)
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return new Response('Server configuration error', { status: 500 })
    }

    // Validate CSRF token
    if (!CSRFProtection.validateRequestToken(request, secret)) {
      return new Response('CSRF validation failed', { status: 403 })
    }

    return handler(request, ...args)
  }
}