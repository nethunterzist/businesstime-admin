import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public endpoint for mobile app featured content - no authentication required
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    let query = supabaseAdmin
      .from('featured_content')
      .select('*')
      .order('sort_order', { ascending: true })

    if (active === 'true') {
      query = query.eq('is_active', true)
    }

    const { data: featuredContent, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      featuredContent: featuredContent || [],
      success: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Public API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}