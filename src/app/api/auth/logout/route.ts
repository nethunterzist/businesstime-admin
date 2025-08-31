import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Çıkış başarılı'
    })

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/'
    })

    return response

  } catch (error) {
    
    return NextResponse.json({
      success: false,
      message: 'Çıkış yapılırken bir hata oluştu'
    }, { status: 500 })
  }
}
