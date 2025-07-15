import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback for development
class MemoryStore {
  private store = new Map<string, { count: number; reset: number }>()

  async get(key: string) {
    const item = this.store.get(key)
    if (!item) return null
    
    if (Date.now() > item.reset) {
      this.store.delete(key)
      return null
    }
    
    return item.count
  }

  async set(key: string, count: number, windowMs: number) {
    this.store.set(key, {
      count,
      reset: Date.now() + windowMs
    })
  }

  async incr(key: string) {
    const item = this.store.get(key)
    if (!item) return 1
    
    if (Date.now() > item.reset) {
      this.store.delete(key)
      return 1
    }
    
    item.count++
    return item.count
  }
}

// Create Redis instance or fallback to memory
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Memory fallback for development
const memoryStore = new MemoryStore()

// Rate limiter configurations
export const loginRateLimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
      analytics: true,
    })
  : null

export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
    })
  : null

// Manual rate limiting for development (without Redis)
export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  if (redis && loginRateLimit) {
    // Use Upstash rate limiting in production
    const result = await loginRateLimit.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset)
    }
  }

  // Fallback to memory-based rate limiting for development
  const key = `rate_limit:${identifier}`
  const current = await memoryStore.get(key) || 0
  
  if (current >= maxAttempts) {
    return {
      success: false,
      limit: maxAttempts,
      remaining: 0,
      reset: new Date(Date.now() + windowMs)
    }
  }

  const newCount = await memoryStore.incr(key)
  if (newCount === 1) {
    await memoryStore.set(key, 1, windowMs)
  }

  return {
    success: true,
    limit: maxAttempts,
    remaining: Math.max(0, maxAttempts - newCount),
    reset: new Date(Date.now() + windowMs)
  }
}

// Get client IP address
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to localhost for development
  return '127.0.0.1'
}

// Rate limit response helper
export function createRateLimitResponse(
  message: string = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
  retryAfter?: number
) {
  const response = new Response(JSON.stringify({
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      ...(retryAfter && { 'Retry-After': retryAfter.toString() })
    }
  })
  
  return response
}

// Format time remaining
export function formatTimeRemaining(reset: Date): string {
  const now = new Date()
  const diff = reset.getTime() - now.getTime()
  
  if (diff <= 0) return '0 saniye'
  
  const minutes = Math.floor(diff / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (minutes > 0) {
    return `${minutes} dakika ${seconds} saniye`
  }
  
  return `${seconds} saniye`
}
