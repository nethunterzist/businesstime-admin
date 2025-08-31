import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    
    // Get push settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('push_settings')
      .select('is_enabled')
      .eq('id', 1)
      .single()

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    // Get device count
    const { count: deviceCount, error: deviceError } = await supabaseAdmin
      .from('device_registrations')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (deviceError) {
      return NextResponse.json({ error: deviceError.message }, { status: 500 })
    }

    // Get recent notification
    const { data: recentNotification, error: notificationError } = await supabaseAdmin
      .from('push_notifications')
      .select('created_at, title')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Don't fail if no notifications exist
    if (notificationError && notificationError.code !== 'PGRST116') {
    }

    const response = {
      isEnabled: settings?.is_enabled || false,
      totalDevices: deviceCount || 0,
      lastNotification: recentNotification ? {
        title: recentNotification.title,
        createdAt: recentNotification.created_at
      } : null
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { isEnabled } = body


    // Validate input
    if (typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'isEnabled must be a boolean' }, 
        { status: 400 }
      )
    }

    // Update push settings
    const { data, error } = await supabaseAdmin
      .from('push_settings')
      .upsert({ 
        id: 1, 
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      isEnabled: data.is_enabled,
      message: `Push notifications ${isEnabled ? 'enabled' : 'disabled'} successfully`
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}
