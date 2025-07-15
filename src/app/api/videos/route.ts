import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('videos')
      .select('*')

    if (search) {
      // Arama terimi varsa, title ve description alanlarında ara
      // tags alanı için daha güvenli bir yaklaşım kullan
      const searchTerm = search.toLowerCase()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    const { data: videos, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ videos: videos || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Tags alanını array'e çevir
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    }
    
    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
