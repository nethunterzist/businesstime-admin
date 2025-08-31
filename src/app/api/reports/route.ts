import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Direct Supabase client creation for API routes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('content_reports')
      .select(`
        *,
        videos!inner(
          id,
          title,
          thumbnail_url,
          duration,
          views
        )
      `)
      .order('reported_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }

    // İstatistikler
    const { data: stats } = await supabase
      .from('content_reports')
      .select('status')

    const statistics = {
      total: stats?.length || 0,
      pending: stats?.filter(r => r.status === 'pending').length || 0,
      under_review: stats?.filter(r => r.status === 'under_review').length || 0,
      resolved: stats?.filter(r => r.status === 'resolved').length || 0,
      dismissed: stats?.filter(r => r.status === 'dismissed').length || 0
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      statistics,
      pagination: {
        offset,
        limit,
        total: statistics.total
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      video_id, 
      device_id, 
      report_type, 
      reason, 
      additional_details,
      user_id 
    } = body

    // Validasyon
    if (!video_id || !device_id || !report_type || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: video_id, device_id, report_type, reason' 
      }, { status: 400 })
    }

    // Direct Supabase client creation for API routes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Aynı video için aynı device'dan önceki raporları kontrol et
    const { data: existingReport } = await supabase
      .from('content_reports')
      .select('id')
      .eq('video_id', video_id)
      .eq('device_id', device_id)
      .single()

    if (existingReport) {
      return NextResponse.json({ 
        error: 'Bu video için zaten bir bildirim gönderdiniz' 
      }, { status: 409 })
    }

    // Yeni rapor oluştur
    const { data: report, error } = await supabase
      .from('content_reports')
      .insert({
        video_id,
        device_id,
        report_type,
        reason,
        additional_details,
        user_id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'İçerik başarıyla bildirildi. İnceleme sürecine alınacak.',
      report
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}