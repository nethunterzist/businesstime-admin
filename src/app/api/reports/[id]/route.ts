import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Raporu güncelle
    const { data: report, error } = await supabase
      .from('content_reports')
      .update({
        status,
        admin_notes,
        action_taken,
        reviewed_by,
        reviewed_at: status !== 'pending' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select(`
        *,
        videos!inner(
          id,
          title,
          thumbnail_url
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error updating report:', error)
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
    }

    // Eğer işlem yapıldıysa, report_actions tablosuna kaydet
    if (action_taken && status === 'resolved') {
      await supabase
        .from('report_actions')
        .insert({
          report_id: reportId,
          action_type: action_taken,
          description: admin_notes,
          performed_by: reviewed_by
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Rapor başarıyla güncellendi',
      report
    })

  } catch (error) {
    console.error('❌ Error in report update:', error)
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

    const { error } = await supabase
      .from('content_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('❌ Error deleting report:', error)
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Rapor başarıyla silindi'
    })

  } catch (error) {
    console.error('❌ Error in report delete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}