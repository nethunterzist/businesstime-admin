import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Bildirimleri ve istatistikleri getir
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        videos(title, thumbnail_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Bildirim istatistikleri
    const { data: stats, error: statsError } = await supabase
      .from('notifications')
      .select(`
        id,
        total_recipients,
        successful_sends,
        failed_sends,
        created_at
      `)

    if (statsError) {
    }

    // Aktif cihaz sayısı
    const { count: activeDevices, error: devicesError } = await supabase
      .from('device_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (devicesError) {
    }

    // İstatistikleri hesapla
    const totalNotifications = notifications?.length || 0
    const totalRecipients = stats?.reduce((sum, notif) => sum + (notif.total_recipients || 0), 0) || 0
    const totalSuccessful = stats?.reduce((sum, notif) => sum + (notif.successful_sends || 0), 0) || 0
    const totalFailed = stats?.reduce((sum, notif) => sum + (notif.failed_sends || 0), 0) || 0

    return NextResponse.json({
      notifications: notifications || [],
      stats: {
        totalNotifications,
        totalRecipients,
        totalSuccessful,
        totalFailed,
        activeDevices: activeDevices || 0,
        successRate: totalRecipients > 0 ? Math.round((totalSuccessful / totalRecipients) * 100) : 0
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' }, 
        { status: 400 }
      )
    }

    // Bildirimi sil (cascade ile recipients de silinir)
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }


    return NextResponse.json({ 
      success: true, 
      message: 'Bildirim başarıyla silindi' 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}