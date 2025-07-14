import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }
    
    // Test 2: Test public client connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('videos')
      .select('count')
      .limit(1);
    
    if (healthError) {
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: healthError.message
      }, { status: 500 });
    }
    
    // Test 3: Test admin client connection
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('videos')
      .select('count')
      .limit(1);
    
    if (adminError) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin connection failed',
        details: adminError.message
      }, { status: 500 });
    }
    
    console.log('✅ Supabase connection successful');
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      config: {
        url: supabaseUrl,
        hasKeys: true
      },
      tests: {
        publicClient: 'OK',
        adminClient: 'OK'
      }
    });
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 