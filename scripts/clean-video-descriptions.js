const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Environment variables'ları yükle
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Supabase bağlantısı
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zcihvuaocrkuftmryrib.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

// Ana fonksiyon
async function cleanVideoDescriptions() {
    console.log('🧹 Video Açıklamalarını Temizleme İşlemi Başlıyor...\n');
    
    try {
        // Tüm videoları getir
        console.log('📥 Videolar getiriliyor...');
        const { data: videos, error } = await supabase
            .from('videos')
            .select('id, title, description')
            .not('description', 'is', null);
            
        if (error) {
            throw new Error(`Videolar getirilirken hata: ${error.message}`);
        }
        
        console.log(`📊 Toplam ${videos.length} video bulundu\n`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Her videoyu işle
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            const progress = Math.round((i / videos.length) * 100);
            
            // Progress gösterimi (her 50 videoda bir)
            if (i % 50 === 0 || i === videos.length - 1) {
                console.log(`🔄 İşleniyor: ${i + 1}/${videos.length} (${progress}%)`);
            }
            
            try {
                const originalDescription = video.description || '';
                const cleanedDescription = cleanHtmlTags(originalDescription);
                
                // Eğer değişiklik varsa güncelle
                if (originalDescription !== cleanedDescription) {
                    const { error: updateError } = await supabase
                        .from('videos')
                        .update({ 
                            description: cleanedDescription,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', video.id);
                        
                    if (updateError) {
                        errorCount++;
                        errors.push({
                            id: video.id,
                            title: video.title,
                            error: updateError.message
                        });
                    } else {
                        updatedCount++;
                    }
                } else {
                    skippedCount++;
                }
                
                // Rate limiting
                if (i < videos.length - 1) {
                    await sleep(50);
                }
                
            } catch (error) {
                errorCount++;
                errors.push({
                    id: video.id,
                    title: video.title || 'Başlıksız',
                    error: error.message
                });
            }
        }
        
        // Final rapor
        console.log('\n\n🎉 VIDEO AÇIKLAMALARI TEMİZLEME TAMAMLANDI!\n');
        console.log('=' .repeat(60));
        console.log(`✅ Güncellenen videolar: ${updatedCount} video`);
        console.log(`⚠️  Zaten temiz olanlar: ${skippedCount} video`);
        console.log(`❌ Hata ile karşılaşan: ${errorCount} video`);
        console.log('=' .repeat(60));
        
        // Hataları detaylı göster
        if (errors.length > 0) {
            console.log('\n📋 HATA DETAYLARI:\n');
            errors.forEach(error => {
                console.log(`❌ Video ID: ${error.id} - ${error.title}`);
                console.log(`   Hata: ${error.error}`);
                console.log('');
            });
        }
        
        // Özet dosyası oluştur
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                updated: updatedCount,
                skipped: skippedCount,
                failed: errorCount,
                total: videos.length
            },
            errors: errors
        };
        
        const reportPath = path.join(__dirname, `../video-cleanup-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📊 Detaylı rapor kaydedildi: ${reportPath}\n`);
        
    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        process.exit(1);
    }
}

// Sleep fonksiyonu
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Script'i çalıştır
if (require.main === module) {
    cleanVideoDescriptions()
        .then(() => {
            console.log('🎉 Temizleme işlemi başarıyla tamamlandı!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script hatası:', error);
            process.exit(1);
        });
}

module.exports = { cleanVideoDescriptions };