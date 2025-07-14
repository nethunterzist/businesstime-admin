# Business Time TV - Admin Panel

Modern, responsive admin panel for Business Time TV video content management system.

## 🚀 Getting Started

### Server Başlatma (XAMPP ile Çakışma Sorunu Çözümü)

**Problem**: XAMPP Apache server port 80'de çalışıyor, Next.js de localhost kullanmaya çalışıyor.

**Çözüm**: Background'da server başlatma

```bash
# Önce proje dizinine git
cd /Applications/XAMPP/xamppfiles/htdocs/app/businesstime-admin

# Background'da server başlat (ÇALIŞAN YÖNTEM!)
nohup npm run dev > server.log 2>&1 &

# Server durumunu kontrol et
ps aux | grep next | grep -v grep

# HTTP response test et
curl -I http://localhost:3000
```

### Alternatif Başlatma Yöntemleri

```bash
# Normal başlatma (Terminal açık kalır)
npm run dev

# Farklı port kullanma
npm run dev -- --port 4001

# Turbopack ile başlatma
npm run dev --turbopack
```

## 🔧 Sorun Giderme

### Server Çalışmıyor mu?

1. **Process kontrol et**:
   ```bash
   ps aux | grep next
   ```

2. **Port kontrol et**:
   ```bash
   curl http://localhost:3000
   ```

3. **XAMPP çakışması**:
   - XAMPP Control Panel → Apache Stop
   - Veya Next.js'i farklı port'ta çalıştır

4. **Background'da başlat**:
   ```bash
   nohup npm run dev > server.log 2>&1 &
   ```

### TypeScript Hataları

Çözülmüş TypeScript hataları:
- `reduce` fonksiyonlarında `total: number` tip eklendi
- Interface hataları düzeltildi

## 📁 Proje Yapısı

```
businesstime-admin/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Ana dashboard
│   │   └── layout.tsx        # App layout
│   ├── components/
│   │   ├── Layout.tsx        # Sidebar layout
│   │   ├── VideoForm.tsx     # Video ekleme formu
│   │   └── pages/
│   │       ├── VideosPage.tsx     # Video yönetimi
│   │       ├── CategoriesPage.tsx # Kategori yönetimi
│   │       └── SettingsPage.tsx   # Ayarlar
│   └── components/ui/
│       ├── button.tsx        # UI bileşenleri
│       ├── input.tsx
│       └── textarea.tsx
├── demo.html                 # HTML demo versiyonu
├── server.log               # Server logları
└── README.md               # Bu dosya
```

## ✨ Özellikler

### Dashboard
- Video, görüntüleme, beğeni istatistikleri
- Kategori durumu
- Trend analizi

### Video Yönetimi
- ✅ Video listeleme ve filtreleme
- ✅ Video ekleme formu (Modal)
- ✅ Video düzenleme
- ✅ Yayın durumu değiştirme
- ✅ Öne çıkarma
- ✅ Toplu işlemler
- ✅ Video önizleme

### Form Özellikleri
- Form validasyonu
- Thumbnail önizleme
- Video URL kontrolü
- Kategori seçimi
- Publish/Feature toggles

### Debugging & Logging
- Kapsamlı console.log sistemi
- Her aksiyon için detaylı log
- Form state tracking
- API call monitoring

## 🎯 Console Log Sistemı

```javascript
// Button clicks
🔘 Yeni Video button clicked!

// Form operations  
🆕 Open Add Video Form called
✅ Video form opened for adding
🎬 VideoForm rendered with props: {...}

// Data operations
📝 Form submitted with data: {...}
💾 Handle Save Video called with: {...}
✅ Video saved successfully!

// Component renders
📺 VideosPage component rendered
🚀 Component mounted, running loadVideos...
```

## 🌐 URL'ler

- **Admin Panel**: http://localhost:3000
- **HTML Demo**: http://localhost/app/businesstime-admin/demo.html
- **Network**: http://192.168.1.64:3000

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **UI Components**: Custom + shadcn/ui pattern
- **State Management**: React useState

## 📝 Development Notes

### Son Çözülen Sorunlar
- ✅ XAMPP port çakışması → Background server
- ✅ TypeScript reduce hatası → Tip ekleme
- ✅ Layout interface sorunu → Function type
- ✅ Loading state problemi → Initial data
- ✅ Form modal açılma sorunu → State management

### Gelecek Özellikler
- Analytics sayfası
- Bulk video upload
- Video player komponenti
- Export/Import fonksiyonları
- Real-time bildirimler

## 🎬 Video Form Özellikleri

### Zorunlu Alanlar
- Video başlığı
- Video URL
- Kategori
- Süre

### Opsiyonel Alanlar
- Açıklama
- Thumbnail URL
- Yayın durumu
- Öne çıkarma

### Validasyon
- URL format kontrolü
- Boş alan kontrolü
- Video format desteği (.mp4, .webm, .mov, YouTube, Vimeo, CDN)

---

**🎉 Admin Panel Successfully Running!** 

Created with ❤️ for Business Time TV
