import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all featured content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('featured_content')
      .select('*')
      .order('sort_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching featured content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch featured content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      featuredContent: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new featured content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image_url, action_type, action_value, sort_order, is_active } = body;

    // Validation
    if (!title || !image_url || !action_type || !action_value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['video', 'category', 'external_url'].includes(action_type)) {
      return NextResponse.json(
        { error: 'Invalid action_type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('featured_content')
      .insert({
        title,
        image_url,
        action_type,
        action_value,
        sort_order: sort_order || 0,
        is_active: is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating featured content:', error);
      return NextResponse.json(
        { error: 'Failed to create featured content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      featuredContent: data,
      message: 'Featured content created successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update sort orders (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      );
    }

    // Update sort orders in a transaction-like manner
    const updatePromises = items.map((item, index) => 
      supabase
        .from('featured_content')
        .update({ sort_order: index + 1 })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const hasErrors = results.some(result => result.error);
    if (hasErrors) {
      console.error('Error updating sort orders:', results);
      return NextResponse.json(
        { error: 'Failed to update sort orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Sort orders updated successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}