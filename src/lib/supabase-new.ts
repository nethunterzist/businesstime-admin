import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey
})

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...')
    
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Connection test successful:', data)
    return { success: true, data }
    
  } catch (err) {
    console.error('❌ Connection error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}