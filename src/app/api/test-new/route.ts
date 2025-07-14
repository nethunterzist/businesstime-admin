import { NextResponse } from 'next/server'
import { supabaseAdmin, testSupabaseConnection } from '@/lib/supabase-new'

export async function GET() {
  try {
    console.log('🔍 Starting comprehensive Supabase test...')
    
    // Test 1: Environment variables
    const envTest = {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    console.log('📋 Environment test:', envTest)
    
    // Test 2: Connection test
    const connectionTest = await testSupabaseConnection()
    console.log('🔗 Connection test:', connectionTest)
    
    // Test 3: Direct query test
    console.log('📊 Testing direct query...')
    const { data: videos, error: videoError, count } = await supabaseAdmin
      .from('videos')
      .select('id, title, views', { count: 'exact' })
      .limit(3)
    
    console.log('📊 Direct query result:', { videos, error: videoError, count })
    
    // Test 4: Categories test
    console.log('📂 Testing categories...')
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .limit(3)
    
    console.log('📂 Categories result:', { categories, error: catError })
    
    return NextResponse.json({
      success: !videoError && !catError,
      tests: {
        environment: envTest,
        connection: connectionTest,
        videos: {
          data: videos || [],
          count: count || 0,
          error: videoError?.message || null
        },
        categories: {
          data: categories || [],
          error: catError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}