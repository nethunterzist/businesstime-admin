import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/jwt'
import { checkRateLimit, getClientIP, createRateLimitResponse, formatTimeRemaining } from '@/lib/rate-limit'
import { loginSchema, validateData, sanitizeInput } from '@/lib/validation'
import { createSecureApiResponse, applyRateLimitHeaders, logSecurityEvent } from '@/lib/security-headers'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Input validation with Zod
    const validation = validateData(loginSchema, body)
    if (!validation.success) {
      
      // Log security event
      logSecurityEvent('login_validation_failed', {
        ip: getClientIP(request),
        errors: validation.errors,
        userAgent: request.headers.get('user-agent')
      }, 'medium')
      
      return createSecureApiResponse({
        success: false,
        message: 'Geçersiz giriş bilgileri',
        errors: validation.errors
      }, 400, request.headers.get('origin') || undefined)
    }

    // Sanitize inputs
    const { username, password } = validation.data!
    const sanitizedUsername = sanitizeInput(username)
    const sanitizedPassword = sanitizeInput(password)


    // Rate limiting check
    const clientIP = getClientIP(request)
    const identifier = `login:${clientIP}:${sanitizedUsername}`
    
    
    const rateLimit = await checkRateLimit(
      identifier,
      parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5'),
      parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15') * 60 * 1000
    )

    if (!rateLimit.success) {
      const timeRemaining = formatTimeRemaining(rateLimit.reset);
      
      logSecurityEvent('login_rate_limited', {
        ip: clientIP, 
        username, 
        remaining: rateLimit.remaining,
        resetTime: rateLimit.reset 
      }, 'high');
      
      return createRateLimitResponse(
        `Çok fazla başarısız giriş denemesi. ${timeRemaining} sonra tekrar deneyin.`,
        Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000)
      )
    }

    // Apply rate limit headers  
    // applyRateLimitHeaders(response, rateLimit.limit, rateLimit.remaining, rateLimit.reset);


    // Environment variables authentication (primary method)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (username === adminUsername && password === adminPassword) {
      
      // Log successful login
      logSecurityEvent('login_success', {
        ip: clientIP,
        username: sanitizedUsername,
        authMethod: 'environment',
        userAgent: request.headers.get('user-agent')
      }, 'low')
      
      // Generate JWT token
      const jwtToken = generateToken({
        userId: '1',
        username: adminUsername,
        role: 'admin'
      })

      // Create secure response with JWT token
      const response = createSecureApiResponse({
        success: true,
        message: 'Giriş başarılı',
        user: {
          id: '1',
          username: adminUsername,
          role: 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@businesstime.com'
        }
      }, 200, request.headers.get('origin') || undefined)

      // Set secure httpOnly cookie
      response.cookies.set('auth-token', jwtToken, {
        httpOnly: true,     // XSS koruması
        secure: process.env.NODE_ENV === 'production', // HTTPS zorunlu (production'da)
        sameSite: 'strict', // CSRF koruması
        maxAge: 7200,       // 2 saat (7200 saniye)
        path: '/'           // Tüm sayfalarda geçerli
      })

      // Apply rate limit headers
      applyRateLimitHeaders(response, rateLimit.limit, rateLimit.remaining, rateLimit.reset)

      return response
    }

    // Try database authentication as backup
    try {
      const { data: adminUsers, error: selectError } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single()

      if (!selectError && adminUsers) {
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, adminUsers.password_hash)

        if (isPasswordValid) {
          
          // Generate JWT token
          const jwtToken = generateToken({
            userId: adminUsers.id,
            username: adminUsers.username,
            role: adminUsers.role
          })

          // Update last login (ignore errors)
          try {
            await supabaseAdmin
              .from('admin_users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', adminUsers.id)
          } catch (updateError) {
          }

          // Create response with JWT token
          const response = NextResponse.json({
            success: true,
            message: 'Giriş başarılı',
            user: {
              id: adminUsers.id,
              username: adminUsers.username,
              role: adminUsers.role,
              email: adminUsers.email
            }
          })

          // Set secure httpOnly cookie
          response.cookies.set('auth-token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7200,
            path: '/'
          })

          return response
        }
      }
    } catch (dbError) {
    }

    // If we reach here, authentication failed
    
    // Log failed login attempt
    logSecurityEvent('login_failed', {
      ip: clientIP,
      username: sanitizedUsername,
      userAgent: request.headers.get('user-agent'),
      reason: 'invalid_credentials'
    }, 'high')
    
    return createSecureApiResponse({
      success: false,
      message: 'Kullanıcı adı veya şifre hatalı!'
    }, 401, request.headers.get('origin') || undefined)

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Giriş yapılırken bir hata oluştu'
    }, { status: 500 })
  }
}
