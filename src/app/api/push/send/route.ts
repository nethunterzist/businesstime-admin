import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Expo } from 'expo-server-sdk'

// Initialize Expo SDK
const expo = new Expo()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, type = 'general', targetVideoId = null } = body

    console.log('Push notification request:', { title, type, targetVideoId });

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
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('push_settings')
      .select('is_enabled')
      .eq('id', 1)
      .single()

    if (settingsError) {
      return NextResponse.json({ error: 'Failed to check push settings' }, { status: 500 })
    }

    if (!settings?.is_enabled) {
      return NextResponse.json(
        { error: 'Push notifications are disabled. Please enable them first.' }, 
        { status: 400 }
      )
    }

    // 2. Get active devices
    const { data: devices, error: devicesError } = await supabaseAdmin
      .from('device_registrations')
      .select('device_id, expo_token, device_type')
      .eq('is_active', true)

    if (devicesError) {
      return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
    }

    if (!devices || devices.length === 0) {
      return NextResponse.json(
        { error: 'No active devices found for push notifications' }, 
        { status: 400 }
      )
    }

    console.log(`Found ${devices.length} active devices for push notification`);
    // 3. Create notification record
    const { data: notification, error: notificationError } = await supabaseAdmin
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
      return NextResponse.json({ error: 'Failed to create notification record' }, { status: 500 })
    }


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
        return false
      }
      return true
    })


    // 5. Send push notifications in chunks
    const chunks = expo.chunkPushNotifications(validMessages)
    let totalSent = 0
    let totalFailed = 0
    const deliveryRecords = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

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
        console.error('Failed to send push notification chunk:', chunkError);
        
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
      const { error: deliveryError } = await supabaseAdmin
        .from('notification_deliveries')
        .insert(deliveryRecords)

      if (deliveryError) {
        console.error('Failed to save delivery records:', deliveryError.message);
      } else {
        console.log(`Saved ${deliveryRecords.length} delivery records`);
      }
    }

    // 7. Update notification statistics
    const { error: updateError } = await supabaseAdmin
      .from('push_notifications')
      .update({
        sent_at: new Date().toISOString(),
        total_sent: totalSent,
        total_failed: totalFailed
      })
      .eq('id', notification.id)

    if (updateError) {
      console.error('Failed to update notification stats:', updateError.message);
    }

    console.log('Push notification completed:', {
      notificationId: notification.id,
      totalDevices: devices.length,
      totalSent,
      totalFailed,
      successRate: `${Math.round((totalSent / devices.length) * 100)}%`
    });

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
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('Fetching recent push notifications');
    
    // Get recent notifications with stats
    const { data: notifications, error } = await supabaseAdmin
      .from('push_notifications')
      .select(`
        *,
        videos(title, thumbnail_url)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      notifications: notifications || [],
      total: notifications?.length || 0
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}
