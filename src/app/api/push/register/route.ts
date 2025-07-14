import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { deviceId, expoToken, deviceType, deviceModel, appVersion, osVersion } = body

    console.log('📱 Registering device for push notifications:', { 
      deviceId: deviceId?.substring(0, 20) + '...', 
      deviceType, 
      deviceModel 
    })

    // Input validation
    if (!deviceId || !expoToken || !deviceType) {
      return NextResponse.json(
        { error: 'deviceId, expoToken, and deviceType are required' }, 
        { status: 400 }
      )
    }

    // Validate device type
    if (!['ios', 'android', 'web'].includes(deviceType)) {
      return NextResponse.json(
        { error: 'deviceType must be ios, android, or web' }, 
        { status: 400 }
      )
    }

    // Validate Expo token format (basic check)
    if (!expoToken.startsWith('ExponentPushToken[') && !expoToken.startsWith('ExpoPushToken[')) {
      console.warn('⚠️ Unusual Expo token format:', expoToken.substring(0, 30) + '...')
    }

    // Register device using Supabase function
    const { data: deviceUuid, error } = await supabase
      .rpc('register_device', {
        p_device_id: deviceId,
        p_expo_token: expoToken,
        p_device_type: deviceType,
        p_device_model: deviceModel || null,
        p_app_version: appVersion || null,
        p_os_version: osVersion || null
      })

    if (error) {
      console.error('❌ Error registering device:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Device registered successfully:', deviceUuid)

    // Get updated device count
    const { count: totalDevices, error: countError } = await supabase
      .from('device_registrations')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (countError) {
      console.error('❌ Error getting device count:', countError)
    }

    return NextResponse.json({
      success: true,
      deviceUuid,
      totalDevices: totalDevices || 0,
      message: 'Device registered for push notifications successfully'
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('📊 Getting device registration statistics...')
    
    // Get device statistics
    const { data: stats, error } = await supabase
      .rpc('get_push_stats')

    if (error) {
      console.error('❌ Error fetching push stats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Device stats retrieved:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

// Update device last seen
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { deviceId } = body

    console.log('🔄 Updating device last seen:', deviceId?.substring(0, 20) + '...')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' }, 
        { status: 400 }
      )
    }

    // Update last seen using Supabase function
    const { data: success, error } = await supabase
      .rpc('update_device_last_seen', {
        p_device_id: deviceId
      })

    if (error) {
      console.error('❌ Error updating device last seen:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Device not found' }, 
        { status: 404 }
      )
    }

    console.log('✅ Device last seen updated successfully')
    return NextResponse.json({
      success: true,
      message: 'Device last seen updated successfully'
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

// Deactivate device
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { deviceId } = body

    console.log('🗑️ Deactivating device:', deviceId?.substring(0, 20) + '...')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' }, 
        { status: 400 }
      )
    }

    // Deactivate device using Supabase function
    const { data: success, error } = await supabase
      .rpc('deactivate_device', {
        p_device_id: deviceId
      })

    if (error) {
      console.error('❌ Error deactivating device:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Device not found' }, 
        { status: 404 }
      )
    }

    console.log('✅ Device deactivated successfully')
    return NextResponse.json({
      success: true,
      message: 'Device deactivated successfully'
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}
