#!/bin/bash

# Bulk Video Upload Script for BusinessTime Admin
# 280 videoyu Supabase'e toplu yükleme

echo "🎬 BusinessTime Toplu Video Yükleme Script'i"
echo "============================================"
echo ""

# Script dizinine git
cd "$(dirname "$0")"

# videos.json dosyasının varlığını kontrol et
if [ ! -f "../videos.json" ]; then
    echo "❌ HATA: videos.json dosyası bulunamadı!"
    echo "   Ana dizinde (../videos.json) videos.json dosyası olmalı."
    exit 1
fi

# Video sayısını göster
VIDEO_COUNT=$(node -p "JSON.parse(require('fs').readFileSync('../videos.json', 'utf8')).length")
echo "📊 Yüklenecek video sayısı: $VIDEO_COUNT"
echo ""

# Kullanıcıdan onay al
read -p "🤔 Bu kadar videoyu yüklemek istediğinizden emin misiniz? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Video yükleme işlemi başlatılıyor..."
    echo "⏳ Bu işlem birkaç dakika sürebilir..."
    echo ""
    
    # NPM script'ini çalıştır
    npm run bulk-upload
    
    # Sonucu kontrol et
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Video yükleme işlemi başarıyla tamamlandı!"
        echo "📊 Detaylı rapor: businesstime-admin/bulk-upload-report-*.json"
        echo ""
        echo "🎉 Tebrikler! 280 video başarıyla işlendi."
    else
        echo ""
        echo "❌ Video yükleme işleminde hata oluştu."
        echo "📋 Loglarda detayları kontrol edin."
        exit 1
    fi
else
    echo ""
    echo "❌ İşlem iptal edildi."
    exit 0
fi