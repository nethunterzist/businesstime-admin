import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Direct REST API call to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Service key exists:', !!serviceKey)
    
    const response = await fetch(`${supabaseUrl}/rest/v1/videos?select=id,title,views&limit=5`, {
      headers: {
        'apikey': serviceKey!,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response:', errorText)
      return NextResponse.json({ 
        error: 'Supabase API call failed', 
        status: response.status,
        details: errorText 
      }, { status: 500 })
    }
    
    const data = await response.json()
    console.log('Supabase data:', data)
    
    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}