const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Environment variables'ları yükle
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Supabase bağlantısı
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcihvuaocrkuftmryrib.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Ana fonksiyon
async function bulkUploadVideos() {
    console.log('🎬 Toplu Video Yükleme İşlemi Başlıyor...\n');
    
    try {
        // Videos.json dosyasını oku (ana dizinden)
        const videosPath = path.join(__dirname, '../../videos.json');
        console.log('📁 Video dosyası okunuyor:', videosPath);
        
        if (!fs.existsSync(videosPath)) {
            throw new Error(`❌ videos.json dosyası bulunamadı: ${videosPath}`);
        }
        
        const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
        console.log(`📊 Toplam ${videosData.length} video bulundu\n`);
        
        // Kategorileri önce yükle
        console.log('📋 Kategoriler yükleniyor...');
        const categories = await loadCategories();
        console.log(`✅ ${Object.keys(categories).length} kategori yüklendi\n`);
        
        // İstatistikler
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        const errors = [];
        
        console.log('🚀 Video yükleme işlemi başlatılıyor...\n');
        
        // Her videoyu işle
        for (let i = 0; i < videosData.length; i++) {
            const video = videosData[i];
            const progress = Math.round((i / videosData.length) * 100);
            
            // Basit progress gösterimi (her 10 videoda bir)
            if (i % 10 === 0 || i === videosData.length - 1) {
                console.log(`📹 İşleniyor: ${i + 1}/${videosData.length} (${progress}%)`);
            }
            
            try {
                // Video verilerini doğrula ve işle
                const result = await processVideo(video, categories, i + 1);
                
                if (result.skipped) {
                    skippedCount++;
                } else if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    errors.push({
                        index: i + 1,
                        title: video.title,
                        error: result.error
                    });
                }
                
                // Rate limiting - her video arasında küçük bekleme
                if (i < videosData.length - 1) {
                    await sleep(100);
                }
                
            } catch (error) {
                errorCount++;
                errors.push({
                    index: i + 1,
                    title: video.title || 'Başlıksız',
                    error: error.message
                });
            }
        }
        
        // Final rapor
        console.log('\n\n🎉 TOPLU VIDEO YÜKLEME TAMAMLANDI!\n');
        console.log('=' .repeat(60));
        console.log(`✅ Başarıyla yüklenen: ${successCount} video`);
        console.log(`⚠️  Atlanan videolar: ${skippedCount} video`);
        console.log(`❌ Hata ile karşılaşan: ${errorCount} video`);
        console.log('=' .repeat(60));
        
        // Hataları detaylı göster
        if (errors.length > 0) {
            console.log('\n📋 HATA DETAYLARI:\n');
            errors.forEach(error => {
                console.log(`❌ Video #${error.index}: ${error.title}`);
                console.log(`   Hata: ${error.error}`);
                console.log('');
            });
        }
        
        // Özet dosyası oluştur
        await createSummaryReport(successCount, skippedCount, errorCount, errors);
        
    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        process.exit(1);
    }
}

// Video işleme fonksiyonu
async function processVideo(videoData, categories, index) {
    try {
        // Zorunlu alanları kontrol et
        if (!videoData.title || !videoData.video_url) {
            return {
                success: false,
                error: 'Başlık veya video URL eksik'
            };
        }
        
        // URL doğrulaması
        if (!isValidUrl(videoData.video_url)) {
            return {
                success: false,
                error: 'Geçersiz video URL formatı'
            };
        }
        
        // Kategori ID'sini bul
        let categoryId = null;
        if (videoData.category_name && categories[videoData.category_name]) {
            categoryId = categories[videoData.category_name];
        } else if (videoData.category_name) {
            // Kategori yoksa oluştur
            categoryId = await createCategory(videoData.category_name);
            categories[videoData.category_name] = categoryId;
        }
        
        // Duplicate kontrolü
        const { data: existingVideo } = await supabase
            .from('videos')
            .select('id, title')
            .eq('title', videoData.title)
            .single();
            
        if (existingVideo) {
            return {
                skipped: true,
                error: 'Video zaten mevcut'
            };
        }
        
        // Video verisini hazırla
        const videoRecord = {
            title: videoData.title.trim(),
            description: cleanHtmlTags(videoData.description || ''),
            video_url: videoData.video_url.trim(),
            thumbnail_url: videoData.thumbnail_url || null,
            category_id: categoryId,
            is_published: true,
            views: 0,
            likes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Veritabanına ekle
        const { data, error } = await supabase
            .from('videos')
            .insert([videoRecord])
            .select()
            .single();
            
        if (error) {
            return {
                success: false,
                error: `Supabase hatası: ${error.message}`
            };
        }
        
        return {
            success: true,
            data: data
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Kategorileri yükle
async function loadCategories() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name');
        
    if (error) {
        throw new Error(`Kategoriler yüklenirken hata: ${error.message}`);
    }
    
    // Kategori adını key, ID'yi value yapan obje oluştur
    const categoryMap = {};
    categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
    });
    
    return categoryMap;
}

// Yeni kategori oluştur
async function createCategory(categoryName) {
    console.log(`\n📁 Yeni kategori oluşturuluyor: ${categoryName}`);
    
    // Slug oluştur (Türkçe karakterleri düzelt)
    const slug = categoryName
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u') 
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    const { data, error } = await supabase
        .from('categories')
        .insert([{
            name: categoryName,
            slug: slug,
            icon: 'folder-outline',
            created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
    if (error) {
        throw new Error(`Kategori oluşturulurken hata: ${error.message}`);
    }
    
    console.log(`✅ Kategori oluşturuldu: ${categoryName} (ID: ${data.id})`);
    return data.id;
}

// HTML etiketlerini temizle
function cleanHtmlTags(text) {
    if (!text) return '';
    
    return text
        .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
        .replace(/&nbsp;/g, ' ') // &nbsp; karakterini boşlukla değiştir
        .replace(/&amp;/g, '&')  // &amp; karakterini & ile değiştir
        .replace(/&lt;/g, '<')   // &lt; karakterini < ile değiştir
        .replace(/&gt;/g, '>')   // &gt; karakterini > ile değiştir
        .replace(/&quot;/g, '"') // &quot; karakterini " ile değiştir
        .replace(/&#39;/g, "'")  // &#39; karakterini ' ile değiştir
        .replace(/\s+/g, ' ')    // Birden fazla boşluğu tek boşlukla değiştir
        .trim();                 // Baş ve sondaki boşlukları kaldır
}

// URL doğrulama
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Sleep fonksiyonu
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Özet raporu oluştur
async function createSummaryReport(successCount, skippedCount, errorCount, errors) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            successful: successCount,
            skipped: skippedCount,
            failed: errorCount,
            total: successCount + skippedCount + errorCount
        },
        errors: errors
    };
    
    const reportPath = path.join(__dirname, `../bulk-upload-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Detaylı rapor kaydedildi: ${reportPath}\n`);
}

// Script'i çalıştır
if (require.main === module) {
    bulkUploadVideos()
        .then(() => {
            console.log('🎉 Script başarıyla tamamlandı!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script hatası:', error);
            process.exit(1);
        });
}

module.exports = { bulkUploadVideos };