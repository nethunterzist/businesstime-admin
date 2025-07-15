# 🚨 PRODUCTION HATA ÇÖZÜMLERİ

## 📅 Tarih: 15 Temmuz 2025 - 22:25

## 🎯 AMAÇ
Production'da karşılaşılan hataların analizi ve çözümleri.

---

## ❌ HATA 1: Video Ekleme - "malformed array literal"

### 🔍 PROBLEM
Video eklerken `malformed array literal: ""` hatası alınıyor.

### 🔧 NEDEN
`tags` alanı PostgreSQL'de array tipinde tanımlı ama frontend'den string olarak gönderiliyor.

### ✅ ÇÖZÜM
`/src/app/api/videos/route.ts` dosyasında POST metodunu güncelle:

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Tags alanını array'e çevir
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }
    
    const { data: video, error } = await supabaseAdmin
      .from('videos')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## ❌ HATA 2: Slider Yönetimi - "Missing required fields"

### 🔍 PROBLEM
Slider görsellerini düzenlerken `❌ Kaydetme hatası: Missing required fields` hatası alınıyor.

### 🔧 NEDEN
`/src/app/api/featured-content/route.ts` dosyasında `title` alanı zorunlu olarak kontrol ediliyor ama frontend'den gönderilmiyor.

### ✅ ÇÖZÜM 1: API'yi Güncelle
`/src/app/api/featured-content/route.ts` dosyasında validation'ı düzenle:

```typescript
// POST - Create new featured content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image_url, action_type, action_value, sort_order, is_active } = body;

    // Validation - title'ı opsiyonel yap veya otomatik oluştur
    if (!image_url || !action_type || !action_value) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url, action_type, action_value' },
        { status: 400 }
      );
    }

    // Title yoksa otomatik oluştur
    const finalTitle = title || `Slider ${Date.now()}`;

    const { data, error } = await supabase
      .from('featured_content')
      .insert({
        title: finalTitle,
        image_url,
        action_type,
        action_value,
        sort_order: sort_order || 0,
        is_active: is_active !== false
      })
      .select()
      .single();
```

### ✅ ÇÖZÜM 2: Frontend'i Güncelle
`/src/components/pages/SliderManagementPage.tsx` dosyasında form state'e title ekle:

```typescript
const [formData, setFormData] = useState({
  title: '', // Ekle
  image_url: '',
  action_type: 'video' as 'video' | 'category' | 'external_url',
  action_value: '',
  is_active: true
});

// Form'a title input'u ekle:
<div>
  <label className="block text-sm font-medium mb-1">Başlık</label>
  <Input
    value={formData.title}
    onChange={(e) => setFormData({...formData, title: e.target.value})}
    placeholder="Slider başlığı"
    required
  />
</div>
```

---

## 🔧 GENEL ÇÖZÜMLERİ UYGULAMA

### 1. Video API'sini Düzelt
```bash
# Video route'unu güncelle
# /src/app/api/videos/route.ts dosyasını düzenle
```

### 2. Slider API'sini Düzelt
```bash
# Featured content route'unu güncelle
# /src/app/api/featured-content/route.ts dosyasını düzenle
```

### 3. Frontend Validasyonları Ekle
```bash
# Form validasyonlarını güçlendir
# Error handling'i iyileştir
```

---

## 📊 HATA DURUMU

| Hata | Durum | Çözüm |
|------|-------|-------|
| Video ekleme - malformed array | ❌ Aktif | Tags string→array dönüşümü |
| Slider - Missing fields | ❌ Aktif | Title alanı eklenmeli |

---

## 🚀 SONRAKI ADIMLAR

1. **Video API'sini güncelle** - Tags array dönüşümü
2. **Slider API'sini güncelle** - Title validation düzelt
3. **Frontend validasyonları ekle** - Daha iyi error handling
4. **Test et** - Production'da çalışıp çalışmadığını kontrol et

---

## 📝 NOTLAR

- Production'da database schema'ları development'tan farklı olabilir
- Array tipindeki alanlar özel işlem gerektirir
- Frontend validation'ları backend ile uyumlu olmalı
- Error message'ları kullanıcı dostu olmalı

---

**Son Güncelleme**: 15 Temmuz 2025, 22:25
**Durum**: 🔧 Çözüm Bekliyor
