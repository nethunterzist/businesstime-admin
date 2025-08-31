-- Fix increment_video_views function with proper RLS bypass
-- Created: 2025-08-25T12:45:00.000Z
-- Purpose: Ensure increment function works for mobile app

-- Drop and recreate the increment function with proper SECURITY DEFINER
DROP FUNCTION IF EXISTS increment_video_views(UUID);

CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS VOID 
SECURITY DEFINER  -- Critical: runs with creator's privileges, bypasses RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the video views, this will bypass RLS due to SECURITY DEFINER
  UPDATE public.videos 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = video_uuid;
  
  -- Optional: Log successful increment for debugging
  -- RAISE NOTICE 'Video % views incremented to %', video_uuid, (SELECT views FROM videos WHERE id = video_uuid);
END;
$$;

-- Grant execute permissions to all roles that need it
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO service_role;

-- Also ensure RLS policies allow updates for authenticated users
DROP POLICY IF EXISTS "Enable UPDATE for anon users" ON public.videos;

CREATE POLICY "Enable UPDATE for anon users" ON public.videos
    AS PERMISSIVE FOR UPDATE
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Ensure proper permissions are granted
GRANT UPDATE (views, likes, updated_at) ON public.videos TO anon;
GRANT UPDATE (views, likes, updated_at) ON public.videos TO authenticated;