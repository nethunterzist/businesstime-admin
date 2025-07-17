import { z } from 'zod'

// Common validation patterns
const urlPattern = z.string().url('Geçerli bir URL giriniz').optional().or(z.literal(''))
const emailPattern = z.string().email('Geçerli bir email adresi giriniz')
const phonePattern = z.string().regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Geçerli bir telefon numarası giriniz')

// Authentication schemas
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(50, 'Kullanıcı adı en fazla 50 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olabilir')
})

// Video management schemas
export const videoSchema = z.object({
  title: z.string()
    .min(1, 'Video başlığı gereklidir')
    .max(200, 'Video başlığı en fazla 200 karakter olabilir')
    .trim(),
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  category_id: z.string()
    .min(1, 'Kategori seçimi gereklidir'),
  thumbnail_url: urlPattern,
  video_url: z.string()
    .url('Geçerli bir video URL\'si giriniz')
    .min(1, 'Video URL\'si gereklidir'),
  tags: z.string()
    .max(500, 'Etiketler en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false)
})

// Category management schemas
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Kategori adı gereklidir')
    .max(100, 'Kategori adı en fazla 100 karakter olabilir')
    .trim(),
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),
  icon_url: urlPattern,
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir hex renk kodu giriniz (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  sort_order: z.number()
    .int('Sıralama tam sayı olmalıdır')
    .min(0, 'Sıralama 0 veya pozitif olmalıdır')
    .default(0),
  is_active: z.boolean().default(true)
})

// Slider/Featured content schemas
export const sliderSchema = z.object({
  title: z.string()
    .max(200, 'Başlık en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
  image_url: z.string()
    .url('Geçerli bir görsel URL\'si giriniz')
    .min(1, 'Görsel URL\'si gereklidir'),
  action_type: z.enum(['video', 'category', 'external'], {
    message: 'Geçerli bir aksiyon tipi seçiniz'
  }),
  action_value: z.string()
    .min(1, 'Aksiyon değeri gereklidir'),
  sort_order: z.number()
    .int('Sıralama tam sayı olmalıdır')
    .min(0, 'Sıralama 0 veya pozitif olmalıdır')
    .default(0),
  is_active: z.boolean().default(true)
})

// Push notification schemas
export const notificationSchema = z.object({
  title: z.string()
    .min(1, 'Bildirim başlığı gereklidir')
    .max(100, 'Bildirim başlığı en fazla 100 karakter olabilir')
    .trim(),
  message: z.string()
    .min(1, 'Bildirim mesajı gereklidir')
    .max(500, 'Bildirim mesajı en fazla 500 karakter olabilir')
    .trim(),
  type: z.enum(['general', 'video', 'category', 'system'], {
    message: 'Geçerli bir bildirim tipi seçiniz'
  }).default('general'),
  data: z.record(z.string(), z.any()).optional()
})

// Settings schemas
export const settingsSchema = z.object({
  key: z.string()
    .min(1, 'Ayar anahtarı gereklidir')
    .max(100, 'Ayar anahtarı en fazla 100 karakter olabilir')
    .regex(/^[a-z0-9_]+$/, 'Ayar anahtarı sadece küçük harf, rakam ve alt çizgi içerebilir'),
  value: z.string()
    .max(10000, 'Ayar değeri en fazla 10000 karakter olabilir'),
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal(''))
})

// Page content schemas
export const pageContentSchema = z.object({
  privacy_policy: z.string()
    .max(50000, 'Gizlilik politikası en fazla 50000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  terms_of_service: z.string()
    .max(50000, 'Kullanım koşulları en fazla 50000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  help_support: z.string()
    .max(50000, 'Yardım içeriği en fazla 50000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  about: z.string()
    .max(50000, 'Hakkında içeriği en fazla 50000 karakter olabilir')
    .optional()
    .or(z.literal(''))
})

// Search settings schemas
export const searchSettingsSchema = z.object({
  suggested_tags: z.string()
    .max(1000, 'Önerilen etiketler en fazla 1000 karakter olabilir')
    .refine(
      (val) => {
        if (!val) return true
        const tags = val.split(',').map(tag => tag.trim()).filter(tag => tag)
        return tags.length <= 20
      },
      'En fazla 20 etiket girebilirsiniz'
    )
    .optional()
    .or(z.literal(''))
})

// Branding settings schemas
export const brandingSettingsSchema = z.object({
  welcome_screen_background: urlPattern,
  welcome_screen_logo: urlPattern,
  welcome_screen_title: z.string()
    .max(100, 'Başlık en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  welcome_screen_subtitle: z.string()
    .max(200, 'Alt başlık en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
  primary_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir hex renk kodu giriniz (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  secondary_color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir hex renk kodu giriniz (#RRGGBB)')
    .optional()
    .or(z.literal(''))
})

// Report schemas
export const reportSchema = z.object({
  video_id: z.string()
    .min(1, 'Video ID gereklidir'),
  reason: z.enum(['inappropriate', 'spam', 'copyright', 'other'], {
    message: 'Geçerli bir şikayet nedeni seçiniz'
  }),
  additional_details: z.string()
    .max(1000, 'Ek detaylar en fazla 1000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  reporter_info: z.string()
    .max(500, 'Şikayet eden bilgisi en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal(''))
})

// Validation helper functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => err.message)
      }
    }
    return {
      success: false,
      errors: ['Bilinmeyen validation hatası']
    }
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .slice(0, 10000) // Max length protection
}

// SQL injection protection
export function escapeSqlString(input: string): string {
  return input.replace(/'/g, "''")
}

// XSS protection for URLs
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// File upload validation (for future use)
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Dosya adı gereklidir')
    .max(255, 'Dosya adı en fazla 255 karakter olabilir')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Dosya adı sadece harf, rakam, nokta, alt çizgi ve tire içerebilir'),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ], {
    message: 'Desteklenmeyen dosya tipi'
  }),
  size: z.number()
    .max(100 * 1024 * 1024, 'Dosya boyutu en fazla 100MB olabilir') // 100MB
    .min(1, 'Dosya boyutu 0 olamaz')
})

// Export all schemas for easy access
export const schemas = {
  login: loginSchema,
  video: videoSchema,
  category: categorySchema,
  slider: sliderSchema,
  notification: notificationSchema,
  settings: settingsSchema,
  pageContent: pageContentSchema,
  searchSettings: searchSettingsSchema,
  brandingSettings: brandingSettingsSchema,
  report: reportSchema,
  fileUpload: fileUploadSchema
}

// Type exports for TypeScript
export type LoginData = z.infer<typeof loginSchema>
export type VideoData = z.infer<typeof videoSchema>
export type CategoryData = z.infer<typeof categorySchema>
export type SliderData = z.infer<typeof sliderSchema>
export type NotificationData = z.infer<typeof notificationSchema>
export type SettingsData = z.infer<typeof settingsSchema>
export type PageContentData = z.infer<typeof pageContentSchema>
export type SearchSettingsData = z.infer<typeof searchSettingsSchema>
export type BrandingSettingsData = z.infer<typeof brandingSettingsSchema>
export type ReportData = z.infer<typeof reportSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>
