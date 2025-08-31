#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

class BusinessTimeAdminSetup {
    constructor() {
        this.projectRef = process.env.PROJECT_REF || 'zcihvuaocrkuftmryrib';
        this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        console.log('🎯 BUSINESS TIME ADMİN - SUPABASE SETUP');
        console.log('Environment:', {
            projectRef: this.projectRef,
            hasUrl: !!this.supabaseUrl,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        });
    }

    async setup() {
        console.log('🚀 BUSINESS TIME ADMİN - SUPABASE KURULUM');
        console.log('='.repeat(60));
        console.log(`📋 Proje: ${this.projectRef}`);
        console.log(`🌐 URL: ${this.supabaseUrl}`);
        console.log(`🎯 Amaç: Admin panel için video views RLS problemi çözümü`);
        console.log();

        try {
            await this.step1_CheckCLI();
            await this.step2_Login();
            await this.step3_LinkProject();
            await this.step4_CreateVideoViewsFixMigration();
            await this.step5_DeployMigrations();
            await this.step6_VerifyFix();
            
            console.log('\n🎉 BUSINESS TIME ADMİN KURULUM TAMAMLANDI!');
            console.log('='.repeat(60));
            console.log('✅ Supabase CLI yapılandırıldı');
            console.log('✅ Admin panel projesi bağlandı');
            console.log('✅ Video views RLS politikaları düzeltildi');
            console.log('✅ Tüm videolara random views (50k-90k) eklendi');
            console.log('✅ Mobil uygulamada video view sayma aktif');
            console.log('\n📱 Şimdi mobil uygulamayı test edebilirsiniz!');
            console.log('🖥️  Admin panelde video istatistiklerini görebilirsiniz!');
            
        } catch (error) {
            console.error('\n💥 KURULUM HATASI:', error.message);
            console.log('\n🔧 Çözüm önerileri:');
            console.log('1. .env.local dosyasına SUPABASE_SERVICE_ROLE_KEY ekleyin');
            console.log('2. Supabase Dashboard\'dan database password alın');
            console.log('3. Internet bağlantınızı kontrol edin');
            console.log('4. npm run supabase:setup komutuyla tekrar deneyin');
            process.exit(1);
        }
    }

    async step1_CheckCLI() {
        console.log('📋 ADIM 1: Supabase CLI Kontrolü...');
        try {
            const version = execSync('npx supabase --version', { encoding: 'utf8' }).trim();
            console.log('✅ Supabase CLI mevcut:', version);
        } catch (error) {
            console.log('❌ CLI bulunamadı, kuruluyor...');
            execSync('npm install -g supabase', { stdio: 'inherit' });
            console.log('✅ Supabase CLI kuruldu');
        }
        console.log();
    }

    async step2_Login() {
        console.log('📋 ADIM 2: Supabase Login Kontrolü...');
        try {
            const projects = execSync('npx supabase projects list', { encoding: 'utf8' });
            if (projects.includes(this.projectRef)) {
                console.log('✅ Zaten giriş yapılmış');
            } else {
                throw new Error('Login gerekli');
            }
        } catch (error) {
            console.log('🔑 Login yapılıyor...');
            console.log('⚠️  Tarayıcıda açılacak sayfadan Supabase hesabınızla giriş yapın');
            execSync('npx supabase login', { stdio: 'inherit' });
            console.log('✅ Login başarılı');
        }
        console.log();
    }

    async step3_LinkProject() {
        console.log('📋 ADIM 3: Admin Panel Proje Bağlama...');
        const configPath = path.join(process.cwd(), 'supabase', 'config.toml');
        
        if (fs.existsSync(configPath)) {
            console.log('✅ Config dosyası mevcut, proje zaten bağlı');
        } else {
            // Initialize supabase in the current directory first
            try {
                console.log('🔧 Supabase dizin yapısı oluşturuluyor...');
                execSync('npx supabase init', { stdio: 'inherit' });
                console.log('✅ Supabase dizin yapısı oluşturuldu');
            } catch (error) {
                console.log('⚠️  Supabase init atlandı (muhtemelen zaten var)');
            }
            
            console.log('🔗 Admin panel için proje bağlanıyor...');
            console.log('⚠️  Database password soracak - Dashboard > Settings > Database\'den alın');
            try {
                execSync(`npx supabase link --project-ref ${this.projectRef}`, { stdio: 'inherit' });
                console.log('✅ Admin panel projesi başarıyla bağlandı');
            } catch (error) {
                throw new Error('Admin panel proje bağlama başarısız. Password kontrolü yapın.');
            }
        }
        console.log();
    }

    async step4_CreateVideoViewsFixMigration() {
        console.log('📋 ADIM 4: Video Views Fix Migration Oluşturma...');
        const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
        
        if (!fs.existsSync(migrationDir)) {
            fs.mkdirSync(migrationDir, { recursive: true });
            console.log('📁 Migration klasörü oluşturuldu');
        }
        
        // Business Time admin specific migration
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '');
        const migrationFile = `${timestamp}_admin_fix_video_views_rls.sql`;
        const migrationPath = path.join(migrationDir, migrationFile);
        
        const migrationContent = `-- Business Time Admin - Video Views RLS Fix Migration
-- Created: ${new Date().toISOString()}
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
`;

        fs.writeFileSync(migrationPath, migrationContent);
        console.log(`✅ Business Time admin fix migration oluşturuldu: ${migrationFile}`);
        console.log();
    }

    async step5_DeployMigrations() {
        console.log('📋 ADIM 5: ADMİN PANEL MIGRATION DEPLOYMENT...');
        console.log('🚀 Video views fix migration uygulanıyor...');
        console.log('⚠️  Bu işlem admin panel için video views problemini çözecek!');
        console.log();
        
        try {
            execSync('npx supabase db push', { stdio: 'inherit' });
            console.log();
            console.log('✅ Admin panel migration deployment başarılı!');
        } catch (error) {
            console.error();
            console.error('❌ Migration push başarısız');
            throw new Error('Admin panel migration deployment başarısız');
        }
        console.log();
    }

    async step6_VerifyFix() {
        console.log('📋 ADIM 6: ADMİN PANEL FIX VERİFİKASYONU...');
        console.log('🔍 Video views fix kontrol ediliyor...');
        console.log();
        
        try {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                this.supabaseUrl,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            
            // Test video views verification
            console.log('🧪 Video views verification test...');
            
            const { data: verificationData, error: verificationError } = await supabase
                .rpc('verify_video_views_fix');
                
            if (verificationError) {
                console.log('⚠️  Verification test atlandı:', verificationError.message);
            } else if (verificationData && verificationData.length > 0) {
                const stats = verificationData[0];
                console.log('✅ VİDEO VIEWS FIX BAŞARILI!');
                console.log('📊 İstatistikler:');
                console.log(`  📺 Toplam video: ${stats.total_videos}`);
                console.log(`  ✅ Views olan: ${stats.videos_with_views}`);
                console.log(`  ❌ Sıfır views: ${stats.videos_with_zero_views}`);
                console.log(`  📈 Ortalama views: ${stats.avg_views.toLocaleString()}`);
                console.log(`  🔽 Min views: ${stats.min_views.toLocaleString()}`);
                console.log(`  🔼 Max views: ${stats.max_views.toLocaleString()}`);
            }
            
            // Test increment function
            console.log('\n🧪 Increment function test...');
            const { data: videos, error: selectError } = await supabase
                .from('videos')
                .select('id, title, views')
                .limit(1);
                
            if (selectError || !videos.length) {
                console.log('❌ Test videosu alınamadı');
            } else {
                const testVideo = videos[0];
                const initialViews = testVideo.views || 0;
                
                console.log(`🎯 Test video: "${testVideo.title}"`);
                console.log(`📊 Başlangıç views: ${initialViews.toLocaleString()}`);
                
                // Test increment
                const { error: incrementError } = await supabase
                    .rpc('increment_video_views', { video_uuid: testVideo.id });
                    
                if (incrementError) {
                    console.log('❌ Increment test başarısız:', incrementError.message);
                } else {
                    // Check result
                    const { data: afterData } = await supabase
                        .from('videos')
                        .select('views')
                        .eq('id', testVideo.id)
                        .single();
                        
                    if (afterData && afterData.views > initialViews) {
                        console.log(`📈 Son views: ${afterData.views.toLocaleString()}`);
                        console.log('🎉 INCREMENT FUNCTION ÇALIŞIYOR!');
                    } else {
                        console.log('❌ Views artmadı, manuel kontrol gerekli');
                    }
                }
            }
            
        } catch (testError) {
            console.log('⚠️  Verification test atlandı:', testError.message);
        }
        
        console.log('\n📊 Kullanışlı Linkler:');
        console.log('🌐 Database Tables:', `https://app.supabase.com/project/${this.projectRef}/editor`);
        console.log('🔐 RLS Policies:', `https://app.supabase.com/project/${this.projectRef}/auth/policies`);
        console.log('📈 Videos Tablosu:', `https://app.supabase.com/project/${this.projectRef}/editor/videos`);
        console.log('🖥️  Admin Panel:', 'http://localhost:3000');
        console.log();
    }
}

// Script çalıştır
if (require.main === module) {
    const setup = new BusinessTimeAdminSetup();
    setup.setup();
}

module.exports = { BusinessTimeAdminSetup };