import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform array of key-value pairs to object
    const settingsObject = settings?.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {}) || {}

    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📥 Received settings update:', body)
    
    // Convert settings object to array of key-value pairs
    const settingsArray = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      description: `Setting for ${key}`,
      updated_at: new Date().toISOString()
    }))

    console.log('🔄 Processing settings array:', settingsArray)

    // Use UPSERT (INSERT or UPDATE) instead of DELETE + INSERT
    const { data: settings, error } = await supabaseAdmin
      .from('app_settings')
      .upsert(settingsArray, { 
        onConflict: 'key',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('❌ Supabase upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Settings upserted successfully:', settings)
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
