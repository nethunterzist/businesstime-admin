import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🛠️ Setting up featured_content table...')

    // Check if table exists first
    const { error: checkError } = await supabaseAdmin
      .from('featured_content')
      .select('id')
      .limit(1)

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('📋 Table does not exist, creating with direct SQL...')
      
      // Use a simple approach - create table via SQL
      try {
        await supabaseAdmin.rpc('create_featured_content_table')
      } catch (rpcError) {
        console.log('⚠️ RPC method failed, using alternative approach...')
      }
    } else {
      console.log('✅ Table already exists!')
    }

    // Try to insert sample data
    const sampleData = [
      {
        title: 'Öne Çıkan Video',
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
        action_type: 'video',
        action_value: 'sample-video-id',
        sort_order: 1,
        is_active: true
      },
      {
        title: 'Popüler Kategoriler',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        action_type: 'category',
        action_value: 'sample-category-id',
        sort_order: 2,
        is_active: true
      },
      {
        title: 'Website Ziyaret Et',
        image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
        action_type: 'external_url',
        action_value: 'https://businesstime.tv',
        sort_order: 3,
        is_active: true
      }
    ]

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('featured_content')
      .upsert(sampleData, { onConflict: 'title' })
      .select()

    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to insert sample data',
        details: insertError.message 
      }, { status: 500 })
    }

    console.log('✅ Featured content table setup complete!')
    return NextResponse.json({ 
      success: true, 
      message: 'Featured content table created and populated',
      data: insertData
    })

  } catch (error) {
    console.error('❌ Setup failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}