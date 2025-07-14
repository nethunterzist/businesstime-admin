import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Expo } from 'expo-server-sdk'

// Initialize Expo SDK
const expo = new Expo()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, type = 'general', targetVideoId = null } = body

    console.log('📨 Sending push notification:', { title, message, type, targetVideoId })

    // Input validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' }, 
        { status: 400 }
      )
    }

    // Validate type
    if (!['general', 'video', 'update', 'trending'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be general, video, update, or trending' }, 
        { status: 400 }
      )
    }

    // 1. Check if push notifications are enabled
    const { data: settings, error: settingsError } = await supabase
      .from('push_settings')
      .select('is_enabled')
      .eq('id', 1)
      .single()

    if (settingsError) {
      console.error('❌ Error fetching push settings:', settingsError)
      return NextResponse.json({ error: 'Failed to check push settings' }, { status: 500 })
    }

    if (!settings?.is_enabled) {
      return NextResponse.json(
        { error: 'Push notifications are disabled. Please enable them first.' }, 
        { status: 400 }
      )
    }

    // 2. Get active devices
    const { data: devices, error: devicesError } = await supabase
      .from('device_registrations')
      .select('device_id, expo_token, device_type')
      .eq('is_active', true)

    if (devicesError) {
      console.error('❌ Error fetching devices:', devicesError)
      return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
    }

    if (!devices || devices.length === 0) {
      return NextResponse.json(
        { error: 'No active devices found for push notifications' }, 
        { status: 400 }
      )
    }

    console.log(`📱 Found ${devices.length} active devices`)

    // 3. Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('push_notifications')
      .insert({
        title,
        message,
        type,
        target_video_id: targetVideoId,
        created_by: 'admin'
      })
      .select()
      .single()

    if (notificationError) {
      console.error('❌ Error creating notification record:', notificationError)
      return NextResponse.json({ error: 'Failed to create notification record' }, { status: 500 })
    }

    console.log('✅ Notification record created:', notification.id)

    // 4. Prepare push notification messages
    const messages = devices.map(device => ({
      to: device.expo_token,
      sound: 'default' as const,
      title,
      body: message,
      data: {
        notificationId: notification.id,
        type,
        videoId: targetVideoId,
        timestamp: new Date().toISOString()
      },
      priority: 'high' as const,
      channelId: 'default'
    }))

    // Filter out invalid tokens
    const validMessages = messages.filter(message => {
      if (!Expo.isExpoPushToken(message.to)) {
        console.warn('⚠️ Invalid Expo push token:', message.to.substring(0, 30) + '...')
        return false
      }
      return true
    })

    console.log(`📤 Sending to ${validMessages.length} valid tokens out of ${messages.length} total`)

    // 5. Send push notifications in chunks
    const chunks = expo.chunkPushNotifications(validMessages)
    let totalSent = 0
    let totalFailed = 0
    const deliveryRecords = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`📦 Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} messages`)

      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk)
        
        // Process tickets and create delivery records
        for (let j = 0; j < tickets.length; j++) {
          const ticket = tickets[j]
          const originalMessage = chunk[j]
          const deviceIndex = validMessages.findIndex(msg => msg.to === originalMessage.to)
          const device = devices[deviceIndex]

          if (ticket.status === 'ok') {
            totalSent++
            deliveryRecords.push({
              notification_id: notification.id,
              device_id: device.device_id,
              expo_ticket_id: ticket.id,
              status: 'sent',
              delivered_at: new Date().toISOString()
            })
          } else {
            totalFailed++
            console.error('❌ Push notification failed:', ticket)
            deliveryRecords.push({
              notification_id: notification.id,
              device_id: device.device_id,
              expo_ticket_id: null,
              status: 'failed',
              error_message: ticket.message || 'Unknown error'
            })
          }
        }
      } catch (chunkError) {
        console.error('❌ Error sending chunk:', chunkError)
        
        // Mark all messages in this chunk as failed
        chunk.forEach(message => {
          const deviceIndex = validMessages.findIndex(msg => msg.to === message.to)
          const device = devices[deviceIndex]
          
          totalFailed++
          deliveryRecords.push({
            notification_id: notification.id,
            device_id: device.device_id,
            expo_ticket_id: null,
            status: 'failed',
            error_message: chunkError instanceof Error ? chunkError.message : 'Chunk send failed'
          })
        })
      }
    }

    // 6. Save delivery records
    if (deliveryRecords.length > 0) {
      const { error: deliveryError } = await supabase
        .from('notification_deliveries')
        .insert(deliveryRecords)

      if (deliveryError) {
        console.error('❌ Error saving delivery records:', deliveryError)
        // Don't fail the request, just log the error
      } else {
        console.log('✅ Delivery records saved:', deliveryRecords.length)
      }
    }

    // 7. Update notification statistics
    const { error: updateError } = await supabase
      .from('push_notifications')
      .update({
        sent_at: new Date().toISOString(),
        total_sent: totalSent,
        total_failed: totalFailed
      })
      .eq('id', notification.id)

    if (updateError) {
      console.error('❌ Error updating notification stats:', updateError)
      // Don't fail the request, just log the error
    }

    console.log('🎉 Push notification sending completed:', {
      notificationId: notification.id,
      totalDevices: devices.length,
      totalSent,
      totalFailed,
      successRate: `${Math.round((totalSent / devices.length) * 100)}%`
    })

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      stats: {
        totalDevices: devices.length,
        totalSent,
        totalFailed,
        successRate: Math.round((totalSent / devices.length) * 100)
      },
      message: `Push notification sent successfully to ${totalSent} devices`
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
    console.log('📊 Getting push notification history...')
    
    // Get recent notifications with stats
    const { data: notifications, error } = await supabase
      .from('push_notifications')
      .select(`
        *,
        videos(title, thumbnail_url)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Error fetching notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Notification history retrieved:', notifications?.length || 0, 'items')
    return NextResponse.json({ 
      notifications: notifications || [],
      total: notifications?.length || 0
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}
