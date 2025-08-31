import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSecureApiResponse, logSecurityEvent } from '@/lib/security-headers'
import { getClientIP } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    
    // Log backup request
    logSecurityEvent('database_backup_requested', {
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    }, 'medium')

    const backupData: {
      metadata: {
        exportedAt: string
        exportedBy: string
        version: string
        type: string
        summary?: {
          totalTables: number
          successfulTables: number
          totalRecords: number
          backupSize: number
        }
      }
      data: Record<string, any>
    } = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'admin',
        version: '1.0.0',
        type: 'full_database_backup'
      },
      data: {}
    }

    // Export all main tables
    const tables = [
      'videos',
      'categories', 
      'featured_content',
      'app_settings',
      'push_notifications',
      'push_notification_settings',
      'reports',
      'report_categories'
    ]

    for (const table of tables) {
      try {
        
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          backupData.data[table] = {
            error: error.message,
            exported: false,
            count: 0
          }
        } else {
          backupData.data[table] = {
            records: data || [],
            exported: true,
            count: data?.length || 0
          }
        }
      } catch (tableError) {
        backupData.data[table] = {
          error: tableError instanceof Error ? tableError.message : 'Unknown error',
          exported: false,
          count: 0
        }
      }
    }

    // Add summary
    const totalRecords = Object.values(backupData.data)
      .filter((table: any) => table.exported)
      .reduce((sum: number, table: any) => sum + table.count, 0)

    backupData.metadata.summary = {
      totalTables: tables.length,
      successfulTables: Object.values(backupData.data).filter((table: any) => table.exported).length,
      totalRecords,
      backupSize: JSON.stringify(backupData).length
    }


    // Log successful backup
    logSecurityEvent('database_backup_completed', {
      ip: getClientIP(request),
      summary: backupData.metadata.summary,
      timestamp: new Date().toISOString()
    }, 'low')

    return createSecureApiResponse(backupData, 200, request.headers.get('origin') || undefined)

  } catch (error) {
    
    // Log backup failure
    logSecurityEvent('database_backup_failed', {
      ip: getClientIP(request),
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 'high')

    return createSecureApiResponse({
      success: false,
      message: 'Database backup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500, request.headers.get('origin') || undefined)
  }
}
