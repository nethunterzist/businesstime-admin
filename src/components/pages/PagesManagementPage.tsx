'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Database, 
  Shield,
  Save,
  CheckCircle,
  Activity,
  AlertTriangle
} from 'lucide-react'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'

export default function PagesManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  // Page content states
  const [pageContents, setPageContents] = useState({
    privacy_policy: '',
    terms_of_service: '',
    help_support: '',
    about: ''
  })
  const [pageContentChanges, setPageContentChanges] = useState({
    privacy_policy: false,
    terms_of_service: false,
    help_support: false,
    about: false
  })

  useEffect(() => {
    loadPageContents()
  }, [])

  const loadPageContents = async () => {
    try {
      console.log('📄 Loading page contents from Supabase...')
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Raw settings data:', data.settings)
        
        // Extract page content from settings with better error handling
        const contents = {
          privacy_policy: '',
          terms_of_service: '',
          help_support: '',
          about: ''
        }

        // Helper function to safely parse JSON content
        const safeParseContent = (rawContent: any, fallback = '') => {
          try {
            if (!rawContent) return fallback
            
            // If it's already a string, return it
            if (typeof rawContent === 'string' && !rawContent.startsWith('{')) {
              return rawContent
            }
            
            // If it's an object, try to get content property
            if (typeof rawContent === 'object' && rawContent.content) {
              return rawContent.content
            }
            
            // Try to parse as JSON
            const parsed = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent
            return parsed.content || fallback
          } catch (error) {
            console.warn(`⚠️ Failed to parse content, using fallback:`, error)
            return fallback
          }
        }

        contents.privacy_policy = safeParseContent(data.settings.privacy_policy_content, 'Gizlilik politikası içeriği yükleniyor...')
        contents.terms_of_service = safeParseContent(data.settings.terms_of_service_content, 'Kullanım koşulları içeriği yükleniyor...')
        contents.help_support = safeParseContent(data.settings.help_support_content, 'Yardım içeriği yükleniyor...')
        contents.about = safeParseContent(data.settings.about_content, 'Hakkında içeriği yükleniyor...')
        
        setPageContents(contents)
        console.log('✅ Page contents loaded:', contents)
      } else {
        console.log('❌ Failed to load page contents, using defaults')
      }
    } catch (error) {
      console.error('❌ Error loading page contents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Page content functions
  const updatePageContent = (pageKey: keyof typeof pageContents, content: string) => {
    setPageContents(prev => ({ ...prev, [pageKey]: content }))
    setPageContentChanges(prev => ({ ...prev, [pageKey]: true }))
  }

  const savePageContent = async (pageKey: keyof typeof pageContents) => {
    try {
      console.log(`💾 Saving ${pageKey} content...`)
      console.log(`📝 Content to save:`, pageContents[pageKey])
      
      const contentData = {
        content: pageContents[pageKey],
        last_updated: new Date().toISOString(),
        updated_by: 'admin'
      }
      
      const requestBody = {
        [`${pageKey}_content`]: JSON.stringify(contentData)
      }
      
      console.log(`📤 Request body:`, requestBody)
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log(`📥 Response status:`, response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log(`✅ ${pageKey} content saved successfully!`, responseData)
        setPageContentChanges(prev => ({ ...prev, [pageKey]: false }))
        
        // Show success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2'
        notification.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          Sayfa içeriği başarıyla güncellendi!
        `
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.remove()
        }, 3000)
      } else {
        const errorData = await response.text()
        console.error(`❌ API Error Response:`, errorData)
        throw new Error(`Failed to save ${pageKey} content: ${response.status} - ${errorData}`)
      }
    } catch (error) {
      console.error(`❌ Error saving ${pageKey} content:`, error)
      alert(`Sayfa içeriği kaydedilirken hata oluştu: ${(error as Error).message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-48 h-7 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-80 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>

        {/* Info Card Skeleton */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-green-200 rounded animate-pulse"></div>
            <div className="w-40 h-5 bg-green-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-green-200 rounded animate-pulse"></div>
            <div className="w-3/4 h-3 bg-green-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Page Content Skeletons */}
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
              <div className="w-48 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Guidelines Skeleton */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-blue-200 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-blue-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-full h-3 bg-blue-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Warning Skeleton */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-yellow-200 rounded animate-pulse"></div>
            <div className="w-32 h-5 bg-yellow-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-yellow-200 rounded animate-pulse"></div>
            <div className="w-5/6 h-3 bg-yellow-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="text-[#9d1112]" size={28} />
              Sayfa Yönetimi
            </h2>
            <p className="text-gray-600 mt-1">Mobil uygulamadaki yasal sayfaların içeriklerini düzenleyin</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-green-50 p-6 rounded-xl border border-green-200">
        <h4 className="font-medium text-green-900 mb-4 flex items-center gap-2">
          <Database size={18} />
          Yasal Sayfa Yönetimi
        </h4>
        <p className="text-sm text-green-700 mb-4">
          Uygulama içerisindeki yasal sayfaların içeriklerini buradan düzenleyebilirsiniz.
          Bu sayfalar mobil uygulamada otomatik olarak güncellenir.
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Policy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={16} />
            Gizlilik Politikası
            {pageContentChanges.privacy_policy && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Değiştirildi
              </span>
            )}
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            Kullanıcıların kişisel verilerinin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi verin.
          </p>
          <Textarea
            value={pageContents.privacy_policy}
            onChange={(e) => updatePageContent('privacy_policy', e.target.value)}
            placeholder="Gizlilik politikası içeriği..."
            rows={8}
            className="mb-3"
          />
          <Button 
            onClick={() => savePageContent('privacy_policy')}
            className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white flex items-center gap-2"
            disabled={!pageContentChanges.privacy_policy}
          >
            <Save size={16} />
            Gizlilik Politikasını Güncelle
          </Button>
        </div>

        {/* Terms of Service */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Database size={16} />
            Kullanım Koşulları
            {pageContentChanges.terms_of_service && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Değiştirildi
              </span>
            )}
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            Uygulamanın kullanım kuralları, kullanıcı sorumlulukları ve hizmet koşulları.
          </p>
          <Textarea
            value={pageContents.terms_of_service}
            onChange={(e) => updatePageContent('terms_of_service', e.target.value)}
            placeholder="Kullanım koşulları içeriği..."
            rows={8}
            className="mb-3"
          />
          <Button 
            onClick={() => savePageContent('terms_of_service')}
            className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white flex items-center gap-2"
            disabled={!pageContentChanges.terms_of_service}
          >
            <Save size={16} />
            Kullanım Koşullarını Güncelle
          </Button>
        </div>

        {/* Help & Support */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Activity size={16} />
            Yardım ve Destek
            {pageContentChanges.help_support && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Değiştirildi
              </span>
            )}
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            Kullanıcıların sık sorulan sorular, iletişim bilgileri ve destek süreçleri.
          </p>
          <Textarea
            value={pageContents.help_support}
            onChange={(e) => updatePageContent('help_support', e.target.value)}
            placeholder="Yardım ve destek içeriği..."
            rows={8}
            className="mb-3"
          />
          <Button 
            onClick={() => savePageContent('help_support')}
            className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white flex items-center gap-2"
            disabled={!pageContentChanges.help_support}
          >
            <Save size={16} />
            Yardım İçeriğini Güncelle
          </Button>
        </div>

        {/* About */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle size={16} />
            Hakkında
            {pageContentChanges.about && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                Değiştirildi
              </span>
            )}
          </h5>
          <p className="text-sm text-gray-600 mb-3">
            Şirket hakkında bilgiler, misyon, vizyon ve iletişim detayları.
          </p>
          <Textarea
            value={pageContents.about}
            onChange={(e) => updatePageContent('about', e.target.value)}
            placeholder="Hakkında sayfası içeriği..."
            rows={8}
            className="mb-3"
          />
          <Button 
            onClick={() => savePageContent('about')}
            className="bg-[#9d1112] hover:bg-[#7a0e0f] text-white flex items-center gap-2"
            disabled={!pageContentChanges.about}
          >
            <Save size={16} />
            Hakkında İçeriğini Güncelle
          </Button>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="text-blue-600" size={18} />
          <h4 className="font-medium text-blue-900">İçerik Rehberi</h4>
        </div>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Gizlilik Politikası:</strong> KVKK ve GDPR uyumlu olmalı, veri toplama ve kullanım süreçlerini açık şekilde belirtmeli.</p>
          <p><strong>Kullanım Koşulları:</strong> Kullanıcı hakları, yasaklanan davranışlar ve hizmet koşullarını net şekilde tanımlamalı.</p>
          <p><strong>Yardım ve Destek:</strong> İletişim kanalları, SSS ve problem çözüm süreçlerini içermeli.</p>
          <p><strong>Hakkında:</strong> Şirket bilgileri, misyon, vizyon ve değerlerinizi yansıtmalı.</p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="text-yellow-600" size={18} />
          <h4 className="font-medium text-yellow-900">Önemli Uyarı</h4>
        </div>
        <p className="text-sm text-yellow-700">
          Sayfa içerikleri değiştirildiğinde, mobil uygulamadaki ilgili sayfalar otomatik olarak güncellenir.
          App Store ve Google Play politikalarına uygun içerik hazırladığınızdan emin olun.
          Yasal metinler için hukuk danışmanınızdan destek almanız önerilir.
        </p>
      </div>
    </div>
  )
}
