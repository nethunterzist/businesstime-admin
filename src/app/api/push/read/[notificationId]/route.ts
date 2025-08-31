import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const body = await request.json()
    const { deviceId } = body
    const { notificationId } = params


    // Input validation
    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' }, 
        { status: 400 }
      )
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' }, 
        { status: 400 }
      )
    }

    // Mark notification as read using Supabase function
    const { data: success, error } = await supabase
      .rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_device_id: deviceId
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Notification delivery record not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const { notificationId } = params


    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' }, 
        { status: 400 }
      )
    }

    // Get notification details with delivery stats
    const { data: notification, error: notificationError } = await supabase
      .from('push_notifications')
      .select(`
        *,
        videos(title, thumbnail_url)
      `)
      .eq('id', notificationId)
      .single()

    if (notificationError) {
      return NextResponse.json({ error: notificationError.message }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' }, 
        { status: 404 }
      )
    }

    // Get delivery statistics
    const { data: deliveryStats, error: statsError } = await supabase
      .from('notification_deliveries')
      .select('status')
      .eq('notification_id', notificationId)

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 })
    }

    // Calculate stats
    const stats = {
      total: deliveryStats?.length || 0,
      sent: deliveryStats?.filter(d => d.status === 'sent').length || 0,
      delivered: deliveryStats?.filter(d => d.status === 'delivered').length || 0,
      failed: deliveryStats?.filter(d => d.status === 'failed').length || 0,
      read: deliveryStats?.filter(d => d.status === 'read').length || 0
    }

    return NextResponse.json({
      notification,
      deliveryStats: stats
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}
