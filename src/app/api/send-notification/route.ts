import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, type = 'general', videoId = null, targetAudience = 'all' } = body

    console.log('📨 Sending notification:', { title, message, type, videoId, targetAudience })

    // Input validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' }, 
        { status: 400 }
      )
    }

    // Supabase fonksiyonunu çağır
    const { data: notificationId, error: functionError } = await supabase
      .rpc('send_notification', {
        notification_title: title,
        notification_message: message,
        notification_type: type,
        target_video_id: videoId,
        target_audience: targetAudience
      })

    if (functionError) {
      console.error('❌ Supabase function error:', functionError)
      return NextResponse.json(
        { error: 'Failed to create notification: ' + functionError.message }, 
        { status: 500 }
      )
    }

    console.log('✅ Notification created with ID:', notificationId)

    // Aktif cihaz tokenlarını al
    const { data: deviceTokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('device_id, push_token, device_type')
      .eq('is_active', true)

    if (tokensError) {
      console.error('❌ Error fetching device tokens:', tokensError)
    }

    const activeDevices = deviceTokens || []
    console.log('📱 Found active devices:', activeDevices.length)

    // Expo Push Notification gönderimi (mock for now)
    let successfulSends = 0
    let failedSends = 0

    if (activeDevices.length > 0) {
      // Her cihaz için notification recipient kaydı oluştur
      const recipients = activeDevices.map(device => ({
        notification_id: notificationId,
        device_token: device.push_token,
        device_type: device.device_type,
        is_delivered: true, // Mock olarak başarılı kabul ediyoruz
        sent_at: new Date().toISOString()
      }))

      const { error: recipientsError } = await supabase
        .from('notification_recipients')
        .insert(recipients)

      if (recipientsError) {
        console.error('❌ Error inserting recipients:', recipientsError)
        failedSends = activeDevices.length
      } else {
        successfulSends = activeDevices.length
        console.log('✅ Notification recipients created:', successfulSends)
      }
    }

    // Notification kaydını güncelle
    const { error: updateError } = await supabase
      .from('notifications')
      .update({
        successful_sends: successfulSends,
        failed_sends: failedSends,
        total_recipients: activeDevices.length
      })
      .eq('id', notificationId)

    if (updateError) {
      console.error('❌ Error updating notification stats:', updateError)
    }

    // TODO: Gerçek push notification servisi entegrasyonu
    // Bu kısımda Expo Push Notifications, Firebase FCM, veya OneSignal kullanılabilir
    console.log('🚀 Mock push notification sent to', successfulSends, 'devices')

    return NextResponse.json({
      success: true,
      notificationId,
      stats: {
        totalRecipients: activeDevices.length,
        successfulSends,
        failedSends
      },
      message: `Bildirim ${successfulSends} cihaza başarıyla gönderildi`
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
    // Son gönderilen bildirimleri listele
    const { data: notifications, error } = await supabase
      .from('notifications')
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

    return NextResponse.json({ 
      notifications: notifications || [],
      total: notifications?.length || 0
    })

  } catch (error) {
    console.error('❌ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}