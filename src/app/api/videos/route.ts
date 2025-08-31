import { NextResponse } from 'next/server'
import { DatabaseAdapter } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let videos
    let error

    if (search) {
      // Arama terimi varsa, title ve description alanlarında ara
      const searchTerm = `%${search.toLowerCase()}%`
      const result = await DatabaseAdapter.query(`
        SELECT * FROM videos 
        WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 
        ORDER BY created_at DESC
      `, [searchTerm])
      videos = result.data
      error = result.error
    } else {
      const result = await DatabaseAdapter.select('videos', { 
        orderBy: 'created_at DESC' 
      })
      videos = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ videos: videos || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Video başlığı zorunludur' }, { status: 400 })
    }
    
    // category_id boş string ise null yap
    if (body.category_id === '') {
      body.category_id = null
    }
    
    // Tags alanını array'e çevir
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
    }
    
    const { data: videos, error } = await DatabaseAdapter.insert('videos', body)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ video: videos?.[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
