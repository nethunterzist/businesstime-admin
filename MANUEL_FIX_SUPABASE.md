# 🚨 MANUEL SUPABASe VIDEO VIEWS FIX REHBERİ

## Problem
Tüm videolar 0 views gösteriyor. RLS (Row Level Security) politikaları video views güncellemesine izin vermiyor.

## Çözüm: Manuel SQL Fix

### 1. Supabase Dashboard'a Gir
- https://app.supabase.com/project/zcihvuaocrkuftmryrib/editor sayfasına git
- SQL Editor'ı aç

### 2. Bu SQL'i Çalıştır (Video Views'ları Güncelle)
```sql
-- Tüm videolara 50k-90k arası random views ekle
UPDATE videos 
SET views = FLOOR(RANDOM() * (90000 - 50000 + 1) + 50000)::BIGINT,
    updated_at = NOW()
WHERE views IS NULL OR views = 0;
```

### 3. RLS Politikalarını Düzelt
```sql
-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Enable read access for all users" ON public.videos;
DROP POLICY IF EXISTS "Enable UPDATE for anon users" ON public.videos;
DROP POLICY IF EXISTS "Enable admin video updates" ON public.videos;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for all users" ON public.videos
    FOR SELECT USING (true);

CREATE POLICY "Enable UPDATE for anon users" ON public.videos
    AS PERMISSIVE FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- İzinleri ver
GRANT SELECT ON public.videos TO anon;
GRANT UPDATE (views, likes, updated_at) ON public.videos TO anon;
GRANT ALL ON public.videos TO authenticated;
```

### 4. Increment Function'ını Düzelt
```sql
-- Mevcut function'ı sil
DROP FUNCTION IF EXISTS increment_video_views(UUID);

-- Yeni function oluştur (SECURITY DEFINER ile)
CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS VOID 
SECURITY DEFINER  -- Bu kritik! Admin yetkisiyle çalışır
LANGUAGE plpgsql
AS $$
BEGIN
  -- Video views'ını 1 artır
  UPDATE public.videos 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = video_uuid;
END;
$$;

-- Tüm rollere execute izni ver
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_video_views(UUID) TO service_role;
```

### 5. Test Et
```sql
-- Video listesini kontrol et
SELECT id, title, views FROM videos LIMIT 10;

-- Test video seç ve increment et
SELECT increment_video_views('VIDEO_ID_BURAYA_YAZI');

-- Sonucu kontrol et
SELECT id, title, views FROM videos WHERE id = 'VIDEO_ID_BURAYA_YAZI';
```

## Alternatif: Service Role Key ile Otomatik Fix

Eğer service role key'in varsa `.env.local` dosyasını güncelle:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sonra şu komutu çalıştır:
```bash
npm run supabase:setup
```

## Service Role Key Nasıl Alınır?

1. https://app.supabase.com/project/zcihvuaocrkuftmryrib/settings/api
2. "service_role" key'i kopyala (secret key)
3. `.env.local` dosyasına ekle

## Sonuç

Bu fix'ten sonra:
- ✅ Tüm videolar 50k-90k arası random views'a sahip olacak
- ✅ Mobil uygulamada video açıldığında views +1 artacak
- ✅ Admin panelde video istatistikleri görünecek

## Test

Mobil uygulamayı aç → Bir video izle → Admin panelden o videonun views'ının arttığını kontrol et.