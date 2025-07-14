import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('Creating Supabase client...')
    console.log('URL:', supabaseUrl)
    console.log('Service key exists:', !!serviceKey)
    
    // Create client with service role key
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('Testing videos table...')
    
    const { data, error, count } = await supabase
      .from('videos')
      .select('id, title, views', { count: 'exact' })
      .limit(5)
    
    console.log('Query result:', { data, error, count })
    
    if (error) {
      return NextResponse.json({ 
        error: 'Supabase query failed', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: count || 0,
      message: `Found ${count || 0} videos`
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}