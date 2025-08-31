import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .select(`
        *,
        categories (
          name,
          color,
          icon
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('🎬 [API PUT] Starting video update process...')
    
    const body = await request.json()
    const { id } = await params
    
    console.log('📝 [API PUT] Request data:', {
      videoId: id,
      bodyKeys: Object.keys(body),
      originalBody: body
    })

    // Validation
    if (body.title !== undefined && (!body.title || !body.title.trim())) {
      console.error('❌ [API PUT] Title validation failed:', body.title)
      return NextResponse.json({ error: 'Video başlığı zorunludur' }, { status: 400 })
    }
    
    // category_id boş string ise null yap
    if (body.category_id === '') {
      console.log('🔄 [API PUT] Converting empty category_id to null')
      body.category_id = null
    }
    
    // Tags alanını array'e çevir
    if (body.tags !== undefined) {
      console.log('🏷️ [API PUT] Processing tags:', { 
        originalTags: body.tags, 
        tagsType: typeof body.tags, 
        isArray: Array.isArray(body.tags) 
      })
      
      if (typeof body.tags === 'string') {
        if (body.tags.trim() === '') {
          console.log('🔄 [API PUT] Converting empty tags string to empty array')
          body.tags = [] // Boş string ise boş array yap
        } else {
          const processedTags = body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
          console.log('🔄 [API PUT] Converting tags string to array:', {
            original: body.tags,
            processed: processedTags
          })
          body.tags = processedTags
        }
      } else if (!Array.isArray(body.tags)) {
        console.log('🔄 [API PUT] Invalid tags format - converting to empty array:', body.tags)
        body.tags = [] // Geçersiz format ise boş array yap
      }
    }

    console.log('📤 [API PUT] Final body before database update:', body)

    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('💾 [API PUT] Database update failed:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        body: body,
        videoId: id
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [API PUT] Video updated successfully:', {
      videoId: video.id,
      title: video.title,
      tags: video.tags
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('💥 [API PUT] Exception occurred:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: error
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}