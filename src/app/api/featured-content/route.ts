import { NextRequest, NextResponse } from 'next/server';
import { DatabaseAdapter } from '@/lib/database';

// GET - Fetch all featured content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const whereCondition = activeOnly ? { is_active: true } : {};
    
    const data = await DatabaseAdapter.select('featured_content', {
      where: whereCondition,
      orderBy: 'sort_order ASC'
    });

    return NextResponse.json({ 
      featuredContent: data || [],
      count: data?.length || 0
    });

  } catch (error) {
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

    // Validation - title'ı opsiyonel yap
    if (!image_url || !action_type || !action_value) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url, action_type, action_value' },
        { status: 400 }
      );
    }

    if (!['video', 'category', 'external_url'].includes(action_type)) {
      return NextResponse.json(
        { error: 'Invalid action_type' },
        { status: 400 }
      );
    }

    // Title yoksa otomatik oluştur
    const finalTitle = title || `Slider ${Date.now()}`;

    const data = await DatabaseAdapter.insert('featured_content', {
      title: finalTitle,
      image_url,
      action_type,
      action_value,
      sort_order: sort_order || 0,
      is_active: is_active !== false
    });

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create featured content' },
        { status: 500 }
      );
    }

    const insertedData = data[0];

    return NextResponse.json({ 
      featuredContent: insertedData,
      message: 'Featured content created successfully'
    });

  } catch (error) {
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

    // Update sort orders sequentially
    try {
      for (let i = 0; i < items.length; i++) {
        await DatabaseAdapter.update('featured_content', {
          sort_order: i + 1
        }, {
          id: items[i].id
        });
      }
    } catch (updateError) {
      return NextResponse.json(
        { error: 'Failed to update sort orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Sort orders updated successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
