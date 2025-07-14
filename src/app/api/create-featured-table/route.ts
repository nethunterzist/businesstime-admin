import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🛠️ Creating featured_content table...')

    // First, try a simple insert to see if table exists
    const { error: testError } = await supabaseAdmin
      .from('featured_content')
      .select('id')
      .limit(1)

    if (testError && testError.message.includes('does not exist')) {
      console.log('📋 Table does not exist, creating manually...')
      
      // Use raw SQL through a stored procedure approach
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.featured_content (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          image_url TEXT NOT NULL,
          action_type TEXT NOT NULL CHECK (action_type IN ('video', 'category', 'external_url')),
          action_value TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_featured_content_active_sort ON public.featured_content(is_active, sort_order);
        CREATE INDEX IF NOT EXISTS idx_featured_content_created_at ON public.featured_content(created_at);
      `

      // Try to execute via a function call (if available)
      try {
        const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { 
          sql: createTableSQL 
        })
        
        if (sqlError) {
          console.log('RPC failed, table might already exist or need manual creation')
        }
      } catch (rpcError) {
        console.log('RPC method not available, table needs manual creation')
      }
    }

    // Now try to insert sample data
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
      .insert(sampleData)
      .select()

    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert sample data', 
        details: insertError.message
      }, { status: 500 })
    }

    console.log('✅ Featured content table setup complete!')
    return NextResponse.json({
      success: true,
      message: 'Table created and populated successfully',
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