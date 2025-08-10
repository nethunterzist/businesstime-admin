import crypto from 'crypto'
import { authenticator } from 'otplib'

/**
 * Two-Factor Authentication utilities
 */
export class TwoFactorAuth {
  
  /**
   * Generate a secret key for TOTP
   */
  static generateSecret(username: string): {
    secret: string
    qrCodeUrl: string
    backupCodes: string[]
  } {
    const secret = authenticator.generateSecret()
    const serviceName = 'BusinessTime Admin'
    
    // Generate QR code URL for authenticator apps
    const qrCodeUrl = authenticator.keyuri(username, serviceName, secret)
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes()
    
    return {
      secret,
      qrCodeUrl,
      backupCodes
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(token: string, secret: string): boolean {
    try {
      // Remove spaces and ensure it's 6 digits
      const cleanToken = token.replace(/\s/g, '')
      if (!/^\d{6}$/.test(cleanToken)) {
        return false
      }

      return authenticator.verify({ token: cleanToken, secret })
    } catch {
      return false
    }
  }

  /**
   * Generate backup codes for recovery
   */
  static generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = []
    
    for (let i = 0; i < count; i++) {
      // Generate 8-digit backup code
      const code = crypto.randomInt(10000000, 99999999).toString()
      codes.push(code)
    }
    
    return codes
  }

  /**
   * Hash backup codes for secure storage
   */
  static async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = (await import('bcryptjs')).default
    const hashedCodes: string[] = []
    
    for (const code of codes) {
      const hash = await bcrypt.hash(code, 12)
      hashedCodes.push(hash)
    }
    
    return hashedCodes
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(code: string, hashedCodes: string[]): Promise<{
    isValid: boolean
    usedCodeIndex?: number
  }> {
    const bcrypt = (await import('bcryptjs')).default
    
    // Remove spaces and validate format
    const cleanCode = code.replace(/\s/g, '')
    if (!/^\d{8}$/.test(cleanCode)) {
      return { isValid: false }
    }

    // Check against all backup codes
    for (let i = 0; i < hashedCodes.length; i++) {
      try {
        const isValid = await bcrypt.compare(cleanCode, hashedCodes[i])
        if (isValid) {
          return { isValid: true, usedCodeIndex: i }
        }
      } catch {
        continue
      }
    }
    
    return { isValid: false }
  }

  /**
   * Generate recovery token for 2FA setup
   */
  static generateRecoveryToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Validate recovery token
   */
  static validateRecoveryToken(token: string, storedToken: string, maxAge: number = 300000): boolean {
    // In production, you'd also check timestamp
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(storedToken, 'hex')
    )
  }

  /**
   * Check if 2FA is required for user
   */
  static is2FARequired(user: any): boolean {
    return user?.two_factor_enabled === true
  }

  /**
   * Generate secure session token after 2FA verification
   */
  static generateSecureSessionToken(): string {
    return crypto.randomBytes(48).toString('hex')
  }

  /**
   * Validate session token format
   */
  static isValidSessionToken(token: string): boolean {
    return /^[a-f0-9]{96}$/.test(token) // 48 bytes = 96 hex chars
  }

  /**
   * Rate limiting for 2FA attempts
   */
  private static attempts: Map<string, { count: number, lastAttempt: number }> = new Map()

  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 300000): {
    allowed: boolean
    remaining: number
    resetTime: Date
  } {
    const now = Date.now()
    const windowStart = now - windowMs
    
    let record = this.attempts.get(identifier)
    
    // Clean up old records or reset if outside window
    if (!record || record.lastAttempt < windowStart) {
      record = { count: 0, lastAttempt: now }
      this.attempts.set(identifier, record)
    }
    
    const remaining = Math.max(0, maxAttempts - record.count)
    const resetTime = new Date(record.lastAttempt + windowMs)
    
    return {
      allowed: record.count < maxAttempts,
      remaining,
      resetTime
    }
  }

  static recordAttempt(identifier: string): void {
    const record = this.attempts.get(identifier)
    if (record) {
      record.count++
      record.lastAttempt = Date.now()
    } else {
      this.attempts.set(identifier, { count: 1, lastAttempt: Date.now() })
    }
  }

  /**
   * Clear rate limit for identifier (after successful auth)
   */
  static clearRateLimit(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Setup instructions for users
   */
  static getSetupInstructions(): {
    steps: string[]
    recommendedApps: { name: string, platforms: string[] }[]
  } {
    return {
      steps: [
        '1. Install a TOTP authenticator app on your mobile device',
        '2. Scan the QR code with your authenticator app',
        '3. Enter the 6-digit code from your app to verify setup',
        '4. Save your backup codes in a secure location',
        '5. Two-factor authentication will be required for future logins'
      ],
      recommendedApps: [
        { name: 'Google Authenticator', platforms: ['iOS', 'Android'] },
        { name: 'Microsoft Authenticator', platforms: ['iOS', 'Android'] },
        { name: 'Authy', platforms: ['iOS', 'Android', 'Desktop'] },
        { name: '1Password', platforms: ['iOS', 'Android', 'Desktop'] }
      ]
    }
  }
}