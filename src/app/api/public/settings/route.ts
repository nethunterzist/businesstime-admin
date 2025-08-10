import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public endpoint for mobile app settings - no authentication required
export async function GET() {
  try {
    const { data: settingsData, error } = await supabaseAdmin
      .from('app_settings')
      .select('key, value')
      .not('key', 'like', 'admin_%')  // Exclude admin settings
      .not('key', 'like', 'secret_%') // Exclude secret settings

    if (error) {
      console.error('Supabase error:', error)
      // Return default settings on error
      return NextResponse.json({ 
        settings: {
          app_name: 'Business Time',
          primary_color: '#9d1112',
          secondary_color: '#ffffff',
          welcome_message: 'İş dünyasından en güncel videolar'
        },
        success: true,
        source: 'fallback'
      })
    }

    // Convert array to object
    const settings: Record<string, any> = {}
    settingsData?.forEach(setting => {
      settings[setting.key] = setting.value
    })

    // Add default values if missing
    const defaultSettings = {
      app_name: 'Business Time',
      primary_color: '#9d1112', 
      secondary_color: '#ffffff',
      welcome_message: 'İş dünyasından en güncel videolar'
    }

    const finalSettings = { ...defaultSettings, ...settings }

    return NextResponse.json({ 
      settings: finalSettings,
      success: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Public API error:', error)
    return NextResponse.json({ 
      settings: {
        app_name: 'Business Time',
        primary_color: '#9d1112',
        secondary_color: '#ffffff', 
        welcome_message: 'İş dünyasından en güncel videolar'
      },
      success: true,
      source: 'error_fallback'
    })
  }
}