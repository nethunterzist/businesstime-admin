import DOMPurify from 'isomorphic-dompurify'

/**
 * Advanced input sanitization and validation utilities
 */
export class InputSanitizer {
  
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    if (!input) return ''
    
    // Use DOMPurify for robust HTML sanitization
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: [],
      FORBID_SCRIPTS: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe'],
      STRIP_COMMENTS: true
    })
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string): string {
    if (!input) return ''
    
    return input
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
      .slice(0, 10000) // Limit length
  }

  /**
   * Sanitize and validate URL
   */
  static sanitizeUrl(input: string): string {
    if (!input) return ''
    
    try {
      const url = new URL(input.trim())
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol')
      }
      
      // Block dangerous ports
      const blockedPorts = ['22', '23', '135', '139', '445', '1433', '3389']
      if (blockedPorts.includes(url.port)) {
        throw new Error('Blocked port')
      }
      
      return url.toString()
    } catch {
      return ''
    }
  }

  /**
   * Sanitize filename for safe file operations
   */
  static sanitizeFilename(input: string): string {
    if (!input) return ''
    
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '') // Allow only safe characters
      .replace(/\.{2,}/g, '.') // Prevent directory traversal
      .replace(/^\.+/, '') // Remove leading dots
      .slice(0, 255) // Limit length
  }

  /**
   * Validate and sanitize email
   */
  static sanitizeEmail(input: string): string {
    if (!input) return ''
    
    const email = input.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      return ''
    }
    
    // Additional safety checks
    if (email.length > 254) return '' // RFC 5321 limit
    if (email.includes('..')) return '' // Double dots not allowed
    
    return email
  }

  /**
   * Sanitize database input to prevent injection
   */
  static sanitizeDbInput(input: string): string {
    if (!input) return ''
    
    return input
      .replace(/'/g, "''") // Escape single quotes
      .replace(/\\/g, '\\\\') // Escape backslashes
      .replace(/\x00/g, '') // Remove null bytes
      .trim()
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: string): any {
    try {
      const parsed = JSON.parse(input)
      return this.deepSanitizeObject(parsed)
    } catch {
      return null
    }
  }

  /**
   * Deep sanitize object recursively
   */
  private static deepSanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj)
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitizeObject(item))
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key)
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.deepSanitizeObject(value)
        }
      }
      return sanitized
    }
    
    return obj
  }

  /**
   * Rate limiting key sanitization
   */
  static sanitizeRateLimitKey(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9:.-]/g, '') // Only allow safe characters
      .slice(0, 100) // Limit length
  }

  /**
   * SQL injection detection
   */
  static containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\bunion\b.*\bselect\b)/i,
      /(\bselect\b.*\bfrom\b)/i,
      /(\binsert\b.*\binto\b)/i,
      /(\bdelete\b.*\bfrom\b)/i,
      /(\bdrop\b.*\btable\b)/i,
      /(\bupdate\b.*\bset\b)/i,
      /(\bexec\b|\bexecute\b)/i,
      /(\bxp_cmdshell\b)/i,
      /('.*or.*'.*=.*')/i,
      /(;.*--)/i,
      /(\bor\b.*=.*)/i,
      /(\band\b.*=.*)/i
    ]
    
    return sqlPatterns.some(pattern => pattern.test(input))
  }

  /**
   * XSS detection
   */
  static containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ]
    
    return xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Comprehensive input validation
   */
  static validateInput(input: string, type: 'text' | 'html' | 'url' | 'email' | 'filename'): {
    isValid: boolean
    sanitized: string
    threats: string[]
  } {
    const threats: string[] = []
    
    // Check for common attack patterns
    if (this.containsSqlInjection(input)) {
      threats.push('SQL Injection')
    }
    
    if (this.containsXSS(input)) {
      threats.push('XSS')
    }
    
    // Sanitize based on type
    let sanitized = ''
    let isValid = true
    
    try {
      switch (type) {
        case 'html':
          sanitized = this.sanitizeHtml(input)
          break
        case 'url':
          sanitized = this.sanitizeUrl(input)
          isValid = sanitized.length > 0
          break
        case 'email':
          sanitized = this.sanitizeEmail(input)
          isValid = sanitized.length > 0
          break
        case 'filename':
          sanitized = this.sanitizeFilename(input)
          isValid = sanitized.length > 0
          break
        default:
          sanitized = this.sanitizeText(input)
      }
    } catch {
      isValid = false
      sanitized = ''
    }
    
    return { isValid, sanitized, threats }
  }
}