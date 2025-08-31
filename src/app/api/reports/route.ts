import { NextRequest, NextResponse } from 'next/server'
import { DatabaseAdapter } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereCondition = status !== 'all' ? { status } : {};
    
    // Get reports with video details using JOIN
    const reportsQuery = `
      SELECT cr.*, v.id as video_id, v.title, v.thumbnail_url, v.duration, v.views
      FROM content_reports cr
      INNER JOIN videos v ON cr.video_id = v.id
      ${status !== 'all' ? 'WHERE cr.status = $3' : ''}
      ORDER BY cr.reported_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const params = status !== 'all' 
      ? [limit, offset, status]
      : [limit, offset];
    
    const reports = await DatabaseAdapter.query(reportsQuery, params);

    // Get statistics
    const stats = await DatabaseAdapter.select('content_reports', {
      columns: ['status']
    });

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

    // Check for existing report from same device for same video
    const existingReport = await DatabaseAdapter.select('content_reports', {
      columns: ['id'],
      where: {
        video_id,
        device_id
      }
    });

    if (existingReport && existingReport.length > 0) {
      return NextResponse.json({ 
        error: 'Bu video için zaten bir bildirim gönderdiniz' 
      }, { status: 409 })
    }

    // Create new report
    const report = await DatabaseAdapter.insert('content_reports', {
      video_id,
      device_id,
      report_type,
      reason,
      additional_details,
      user_id,
      status: 'pending'
    });

    if (!report || report.length === 0) {
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