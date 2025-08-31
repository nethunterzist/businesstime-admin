import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id } = await params
    const { isLiked, deviceId } = body


    // Track user interaction
    const { error: interactionError } = await supabaseAdmin
      .from('user_interactions')
      .insert({
        device_id: deviceId,
        video_id: id,
        interaction_type: isLiked ? 'like' : 'unlike'
      })

    if (interactionError) {
    }

    // Update video likes count
    const { data: currentVideo, error: fetchError } = await supabaseAdmin
      .from('videos')
      .select('likes')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const newLikesCount = Math.max(0, (currentVideo.likes || 0) + (isLiked ? 1 : -1))

    const { data: updatedVideo, error: updateError } = await supabaseAdmin
      .from('videos')
      .update({ likes: newLikesCount })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }


    return NextResponse.json({ 
      success: true, 
      video: updatedVideo,
      likesCount: newLikesCount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}