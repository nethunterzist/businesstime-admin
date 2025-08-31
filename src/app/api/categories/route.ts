import { NextResponse } from 'next/server'
import { DatabaseAdapter } from '@/lib/database'

export async function GET() {
  try {
    const { data: categories, error } = await DatabaseAdapter.select('categories', {
      orderBy: 'sort_order ASC'
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data: categories, error } = await DatabaseAdapter.insert('categories', body)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ category: categories?.[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}