import bcrypt from 'bcryptjs'

/**
 * Password security utilities
 */
export class PasswordSecurity {
  
  /**
   * Password strength requirements
   */
  private static readonly requirements = {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxRepeatingChars: 3,
    preventCommonPatterns: true
  }

  /**
   * Common weak passwords to block
   */
  private static readonly weakPasswords = [
    'admin123', 'password', 'password123', 'admin', '123456', 
    'qwerty', 'letmein', 'welcome', 'monkey', '1234567890',
    'businesstime', 'admin2024', 'admin2025', 'root', 'user'
  ]

  /**
   * Common patterns to avoid
   */
  private static readonly weakPatterns = [
    /^(.)\1+$/, // All same character
    /^(012|123|234|345|456|567|678|789|890)+/, // Sequential numbers
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i, // Sequential letters
    /^(.{1,3})\1+$/, // Repeated short patterns
    /keyboard|qwerty|asdf|zxcv/i, // Keyboard patterns
  ]

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean
    strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
    errors: string[]
    score: number
  } {
    const errors: string[] = []
    let score = 0

    // Length check
    if (password.length < this.requirements.minLength) {
      errors.push(`Password must be at least ${this.requirements.minLength} characters long`)
    } else {
      score += Math.min(25, password.length - this.requirements.minLength + 10)
    }

    if (password.length > this.requirements.maxLength) {
      errors.push(`Password must be no more than ${this.requirements.maxLength} characters long`)
    }

    // Character requirements
    if (this.requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else if (/[A-Z]/.test(password)) {
      score += 10
    }

    if (this.requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else if (/[a-z]/.test(password)) {
      score += 10
    }

    if (this.requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    } else if (/\d/.test(password)) {
      score += 10
    }

    if (this.requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 15
    }

    // Check for repeating characters
    if (this.hasRepeatingChars(password, this.requirements.maxRepeatingChars)) {
      errors.push(`Password cannot have more than ${this.requirements.maxRepeatingChars} repeating characters`)
    } else {
      score += 10
    }

    // Check against weak passwords
    if (this.weakPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common and easily guessed')
      score -= 30
    }

    // Check against weak patterns
    if (this.requirements.preventCommonPatterns && this.hasWeakPattern(password)) {
      errors.push('Password contains common patterns that make it easily guessable')
      score -= 20
    } else {
      score += 15
    }

    // Character diversity bonus
    const uniqueChars = new Set(password).size
    if (uniqueChars > password.length * 0.7) {
      score += 10
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    // Determine strength
    let strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
    if (score >= 80) strength = 'very-strong'
    else if (score >= 60) strength = 'strong'
    else if (score >= 40) strength = 'moderate'
    else strength = 'weak'

    return {
      isValid: errors.length === 0 && score >= 60,
      strength,
      errors,
      score
    }
  }

  /**
   * Check for repeating characters
   */
  private static hasRepeatingChars(password: string, maxRepeats: number): boolean {
    let count = 1
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        count++
        if (count > maxRepeats) return true
      } else {
        count = 1
      }
    }
    return false
  }

  /**
   * Check for weak patterns
   */
  private static hasWeakPattern(password: string): boolean {
    return this.weakPatterns.some(pattern => pattern.test(password))
  }

  /**
   * Generate secure password hash
   */
  static async hashPassword(password: string): Promise<string> {
    const validation = this.validatePassword(password)
    if (!validation.isValid) {
      throw new Error(`Password does not meet security requirements: ${validation.errors.join(', ')}`)
    }

    // Use high cost factor for security
    const saltRounds = 14
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch {
      return false
    }
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    const allChars = uppercase + lowercase + numbers + symbols
    
    let password = ''
    
    // Ensure at least one character from each required set
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('')
  }

  /**
   * Check if password has been compromised (simple local check)
   */
  static isPasswordCompromised(password: string): boolean {
    // Simple check against known compromised passwords
    const compromisedHashes = [
      // MD5 hashes of very common passwords
      '5d41402abc4b2a76b9719d911017c592', // hello
      'e10adc3949ba59abbe56e057f20f883e', // 123456  
      '25d55ad283aa400af464c76d713c07ad', // 12345678
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // password
    ]
    
    // In production, this should integrate with HaveIBeenPwned API
    // or similar service for comprehensive checking
    
    return this.weakPasswords.includes(password.toLowerCase())
  }

  /**
   * Get password requirements for client-side display
   */
  static getRequirements() {
    return {
      minLength: this.requirements.minLength,
      maxLength: this.requirements.maxLength,
      requireUppercase: this.requirements.requireUppercase,
      requireLowercase: this.requirements.requireLowercase,
      requireNumbers: this.requirements.requireNumbers,
      requireSpecialChars: this.requirements.requireSpecialChars,
      maxRepeatingChars: this.requirements.maxRepeatingChars,
      preventCommonPatterns: this.requirements.preventCommonPatterns
    }
  }
}