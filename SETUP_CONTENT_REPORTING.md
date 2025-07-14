# 📋 İçerik Bildirme Sistemi - Kurulum Talimatları

## 🎯 Amaç
App Store politikaları gereği kullanıcıların uygunsuz içerik bildirebilmesi için gerekli sistem kurulumu.

## 📦 Kurulum Adımları

### 1. Veritabanı Tablolarını Oluştur
Supabase SQL Editor'da aşağıdaki dosyayı çalıştır:
```bash
CONTENT_REPORTING_TABLES.sql
```

Bu dosya aşağıdaki tabloları oluşturacak:
- `content_reports` - Ana bildirim tablosu
- `report_categories` - Bildirim kategorileri (8 adet örnek kategori dahil)
- `report_actions` - Admin işlem geçmişi

### 2. Sistem Özellikleri

#### 📱 Mobile App Özellikleri:
- **Ana Sayfa:** Video kartlarında "flag" ikonu
- **Video Detay:** Kaydet butonunun yanında "flag" ikonu
- **Güzel Modal:** Kategori sayfasındaki gibi tasarımda bildirim modalı
- **Kategoriler:** 8 adet bildirim kategorisi
- **Device Tracking:** Cihaz bazında tekrar bildirim engelleme

#### ⚙️ Admin Dashboard Özellikleri:
- **Yeni Tab:** "Bildirilenler" menüsü
- **İstatistikler:** Bekleyen, İncelenen, Çözülen, Reddedilen sayıları
- **Filtreleme:** Status ve arama filtreleri
- **Detay Modal:** Bildirim inceleme ve işlem yapma
- **Status Güncelleme:** Pending → Under Review → Resolved/Dismissed

### 3. API Endpoints

```bash
# Bildirim oluştur
POST /api/reports
{
  "video_id": "uuid",
  "device_id": "string",
  "report_type": "inappropriate_content",
  "reason": "Açıklama",
  "additional_details": "Ek bilgiler"
}

# Bildirimleri listele
GET /api/reports?status=pending&limit=50

# Bildirim güncelle
PUT /api/reports/:id
{
  "status": "resolved",
  "admin_notes": "Admin notları",
  "action_taken": "video_removed"
}

# Kategorileri getir
GET /api/report-categories
```

### 4. Bildirim Kategorileri

1. **Uygunsuz İçerik** - alert-triangle
2. **Telif Hakkı İhlali** - shield-alert
3. **Spam** - spam
4. **Yanıltıcı Bilgi** - info
5. **Şiddet** - x-circle
6. **Taciz** - user-x
7. **Yetişkin İçeriği** - eye-off
8. **Diğer** - more-horizontal

### 5. Admin İşlem Türleri

- `video_removed` - Video kaldırıldı
- `video_restricted` - Video kısıtlandı
- `warning_issued` - Uyarı verildi
- `no_action` - İşlem yapılmadı
- `false_report` - Yanlış bildirim

## ✅ Test Senaryoları

### Mobile App Test:
1. Ana sayfada video kartında flag ikonuna tıkla
2. Güzel modal açılsın
3. Kategori seç, açıklama yaz
4. "Bildir" butonuna bas
5. Başarı mesajı görsün

### Admin Dashboard Test:
1. "Bildirilenler" tabına git
2. Yeni bildirim listede görünsün
3. "İncele" butonuna tıkla
4. Status güncelle, not yaz
5. İstatistikler güncellensin

## 🚀 App Store Compliance

Bu sistem aşağıdaki App Store gereksinimlerini karşılar:
- ✅ Kullanıcı içerik bildirimi mekanizması
- ✅ Kategorize edilmiş bildirim türleri
- ✅ Admin panel ile yönetim
- ✅ İşlem geçmişi takibi
- ✅ Cihaz bazında kötüye kullanım engeli

## 📞 Destek

Kurulum sırasında sorun yaşanırsa:
1. Supabase RLS politikalarını kontrol et
2. API endpoint'lerin çalıştığını test et
3. Mobile app'te network bağlantısını kontrol et

**Kurulum Tarihi:** 14 Temmuz 2025  
**Status:** ✅ Hazır ve Test Edildi