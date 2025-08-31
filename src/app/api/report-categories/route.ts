import { NextRequest, NextResponse } from 'next/server'
import { DatabaseAdapter } from '@/lib/database'

export async function GET() {
  try {
    const categories = await DatabaseAdapter.select('report_categories', {
      where: { is_active: true },
      orderBy: 'sort_order ASC'
    });

    return NextResponse.json({
      success: true,
      categories: categories || []
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}