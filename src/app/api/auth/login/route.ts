import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

    // Check if admin users table exists, if not create it
    const { data: adminUsers, error: selectError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single()

    if (selectError && selectError.code === 'PGRST116') {
      // Table doesn't exist, create it with default admin user
      const { error: createTableError } = await supabaseAdmin.rpc('create_admin_users_table')
      
      if (createTableError) {
        console.error('Error creating admin_users table:', createTableError)
        
        // Fallback: Use simple validation for now
        if (username === 'admin' && password === 'admin123') {
          return NextResponse.json({
            success: true,
            token: 'admin_session_token',
            user: {
              id: '1',
              username: 'admin',
              role: 'admin',
              email: 'admin@businesstime.com'
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Kullanıcı adı veya şifre hatalı!'
          }, { status: 401 })
        }
      }

      // Try to get admin user again
      const { data: newAdminUser } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single()

      if (!newAdminUser) {
        return NextResponse.json({
          success: false,
          message: 'Kullanıcı bulunamadı!'
        }, { status: 401 })
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, newAdminUser.password_hash)

      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          message: 'Kullanıcı adı veya şifre hatalı!'
        }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        token: `auth_${newAdminUser.id}_${Date.now()}`,
        user: {
          id: newAdminUser.id,
          username: newAdminUser.username,
          role: newAdminUser.role,
          email: newAdminUser.email
        }
      })
    }

    if (selectError) {
      console.error('Database error:', selectError)
      return NextResponse.json({
        success: false,
        message: 'Veritabanı hatası oluştu'
      }, { status: 500 })
    }

    if (!adminUsers) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı bulunamadı!'
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUsers.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı!'
      }, { status: 401 })
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUsers.id)

    return NextResponse.json({
      success: true,
      token: `auth_${adminUsers.id}_${Date.now()}`,
      user: {
        id: adminUsers.id,
        username: adminUsers.username,
        role: adminUsers.role,
        email: adminUsers.email
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Giriş yapılırken bir hata oluştu'
    }, { status: 500 })
  }
}