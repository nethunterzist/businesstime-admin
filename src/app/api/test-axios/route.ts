import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  try {
    console.log('🔍 Testing with Axios...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const response = await axios.get(`${supabaseUrl}/rest/v1/videos?select=id,title,views&limit=3`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
    
    console.log('✅ Axios success:', response.data)
    
    return NextResponse.json({
      success: true,
      data: response.data,
      count: response.data.length,
      method: 'axios'
    })
    
  } catch (error: any) {
    console.error('❌ Axios error:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      method: 'axios'
    }, { status: 500 })
  }
}