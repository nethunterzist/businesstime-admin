import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı adı ve şifre gereklidir'
      }, { status: 400 })
    }

    console.log('🔐 JWT Login attempt:', { username, password: '***' })

    // Environment variables authentication (primary method)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (username === adminUsername && password === adminPassword) {
      console.log('✅ Environment authentication successful')
      
      // Generate JWT token
      const jwtToken = generateToken({
        userId: '1',
        username: adminUsername,
        role: 'admin'
      })

      // Create response with JWT token in httpOnly cookie
      const response = NextResponse.json({
        success: true,
        message: 'Giriş başarılı',
        user: {
          id: '1',
          username: adminUsername,
          role: 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@businesstime.com'
        }
      })

      // Set secure httpOnly cookie
      response.cookies.set('auth-token', jwtToken, {
        httpOnly: true,     // XSS koruması
        secure: process.env.NODE_ENV === 'production', // HTTPS zorunlu (production'da)
        sameSite: 'strict', // CSRF koruması
        maxAge: 7200,       // 2 saat (7200 saniye)
        path: '/'           // Tüm sayfalarda geçerli
      })

      console.log('✅ JWT token generated and cookie set')
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
          console.log('✅ Database authentication successful')
          
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
            console.log('⚠️ Could not update last login, but continuing...')
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
      console.log('⚠️ Database authentication failed, using environment only')
    }

    // If we reach here, authentication failed
    console.log('❌ Authentication failed for username:', username)
    return NextResponse.json({
      success: false,
      message: 'Kullanıcı adı veya şifre hatalı!'
    }, { status: 401 })

  } catch (error) {
    console.error('❌ Login error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Giriş yapılırken bir hata oluştu'
    }, { status: 500 })
  }
}
