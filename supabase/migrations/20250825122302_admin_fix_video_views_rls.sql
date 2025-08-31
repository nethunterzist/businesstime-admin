-- Business Time Admin - Video Views RLS Fix Migration
-- Created: 2025-08-25T12:23:02.764Z
-- Purpose: Fix RLS policies for admin panel video views management

-- 1. Fix RLS policies for videos table to allow admin operations
DROP POLICY IF EXISTS "Enable read access for all users" ON public.videos;
DROP POLICY IF EXISTS "Enable UPDATE for anon users" ON public.videos;
DROP POLICY IF EXISTS "Enable admin video updates" ON public.videos;

-- Create comprehensive RLS policies
CREATE POLICY "Enable read access for all users" ON public.videos
    FOR SELECT USING (true);

CREATE POLICY "Enable UPDATE for anon users" ON public.videos
    AS PERMISSIVE FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Admin panel policy for full CRUD operations
CREATE POLICY "Enable admin video updates" ON public.videos
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Grant explicit permissions for video operations
GRANT SELECT ON public.videos TO anon;
GRANT UPDATE (views, likes, updated_at) ON public.videos TO anon;
GRANT SELECT, UPDATE, INSERT, DELETE ON public.videos TO authenticated;

-- 3. Recreate increment_video_views function with proper security
DROP FUNCTION IF EXISTS increment_video_views(UUID);

CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS VOID 
SECURITY DEFINER -- Critical: runs with elevated privileges
LANGUAGE plpgsql
AS $$
BEGIN
  -- Increment views for the specific video
  UPDATE public.videos 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = video_uuid;
  
  -- Log the increment (optional, for debugging)
  -- RAISE NOTICE 'Video % views incremented', video_uuid;
END;
$$;

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO service_role;

-- 4. Update all zero-view videos with random views (50k-90k)
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update videos with 0 or NULL views
    UPDATE public.videos 
    SET views = FLOOR(RANDOM() * (90000 - 50000 + 1) + 50000)::BIGINT,
        updated_at = NOW()
    WHERE views IS NULL OR views = 0;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % videos with random views between 50k-90k', updated_count;
END $$;

-- 5. Create admin bulk update function for testing
CREATE OR REPLACE FUNCTION admin_bulk_update_video_views()
RETURNS INTEGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update all videos or just zero-view ones
  UPDATE public.videos 
  SET views = FLOOR(RANDOM() * (90000 - 50000 + 1) + 50000)::BIGINT,
      updated_at = NOW()
  WHERE views IS NULL OR views = 0;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log the operation
  RAISE NOTICE 'Bulk updated % videos with random views', updated_count;
  
  RETURN updated_count;
END;
$$;

-- Grant execute to all roles
GRANT EXECUTE ON FUNCTION admin_bulk_update_video_views() TO anon;
GRANT EXECUTE ON FUNCTION admin_bulk_update_video_views() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_bulk_update_video_views() TO service_role;

-- 6. Create a verification function for admin panel
CREATE OR REPLACE FUNCTION verify_video_views_fix()
RETURNS TABLE(
    total_videos INTEGER,
    videos_with_views INTEGER,
    videos_with_zero_views INTEGER,
    avg_views NUMERIC,
    min_views BIGINT,
    max_views BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_videos,
        COUNT(CASE WHEN v.views > 0 THEN 1 END)::INTEGER as videos_with_views,
        COUNT(CASE WHEN v.views = 0 OR v.views IS NULL THEN 1 END)::INTEGER as videos_with_zero_views,
        ROUND(AVG(COALESCE(v.views, 0)), 2) as avg_views,
        MIN(COALESCE(v.views, 0)) as min_views,
        MAX(COALESCE(v.views, 0)) as max_views
    FROM public.videos v;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_video_views_fix() TO anon;
GRANT EXECUTE ON FUNCTION verify_video_views_fix() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_video_views_fix() TO service_role;
