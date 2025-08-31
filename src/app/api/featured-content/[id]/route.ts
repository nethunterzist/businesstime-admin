import { NextRequest, NextResponse } from 'next/server';
import { DatabaseAdapter } from '@/lib/database';

// GET - Fetch single featured content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await DatabaseAdapter.select('featured_content', {
      where: { id: params.id }
    });

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Featured content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ featuredContent: data[0] });

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

    const updatedData = await DatabaseAdapter.update('featured_content', {
      title,
      image_url,
      action_type,
      action_value,
      sort_order,
      is_active
    }, {
      id: params.id
    });

    if (!updatedData || updatedData.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update featured content' },
        { status: 500 }
      );
    }

    const data = updatedData[0];

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
    const deletedData = await DatabaseAdapter.delete('featured_content', {
      id: params.id
    });

    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json(
        { error: 'Featured content not found or failed to delete' },
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