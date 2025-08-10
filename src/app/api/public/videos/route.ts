import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public endpoint for mobile app - no authentication required
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let query = supabaseAdmin
      .from('videos')
      .select(`
        *,
        categories (
          name,
          color,
          icon
        )
      `)
      .eq('is_published', true) // Only published videos for mobile

    if (search) {
      const searchTerm = search.toLowerCase()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    const { data: videos, error } = await query
      .order('created_at', { ascending: false })
      .limit(50) // Limit for mobile performance

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      videos: videos || [],
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