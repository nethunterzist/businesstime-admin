import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch single featured content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('featured_content')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Featured content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ featuredContent: data });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update featured content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({
        title,
        image_url,
        action_type,
        action_value,
        sort_order,
        is_active
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update featured content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      featuredContent: data,
      message: 'Featured content updated successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete featured content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('featured_content')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete featured content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Featured content deleted successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}