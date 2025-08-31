import { NextRequest, NextResponse } from 'next/server'
import { DatabaseAdapter } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, admin_notes, action_taken, reviewed_by } = body
    const reportId = params.id

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Update report
    const report = await DatabaseAdapter.update('content_reports', {
      status,
      admin_notes,
      action_taken,
      reviewed_by,
      reviewed_at: status !== 'pending' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }, {
      id: reportId
    });

    if (!report || report.length === 0) {
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
    }

    // Get updated report with video details
    const updatedReportQuery = `
      SELECT cr.*, v.id as video_id, v.title, v.thumbnail_url
      FROM content_reports cr
      INNER JOIN videos v ON cr.video_id = v.id
      WHERE cr.id = $1
    `;
    
    const reportWithVideo = await DatabaseAdapter.query(updatedReportQuery, [reportId]);

    // If action taken and resolved, save to report_actions
    if (action_taken && status === 'resolved') {
      await DatabaseAdapter.insert('report_actions', {
        report_id: reportId,
        action_type: action_taken,
        description: admin_notes,
        performed_by: reviewed_by
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Rapor başarıyla güncellendi',
      report: reportWithVideo[0] || report[0]
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    const deletedReport = await DatabaseAdapter.delete('content_reports', {
      id: reportId
    });

    if (!deletedReport || deletedReport.length === 0) {
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Rapor başarıyla silindi'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}