'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle, 
  Eye, 
  Check, 
  X, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  Flag,
  Shield,
  User,
  Calendar,
  Play
} from 'lucide-react'
import KPICardSkeleton from '@/components/skeletons/KPICardSkeleton'
import TableRowSkeleton from '@/components/skeletons/TableRowSkeleton'

interface Report {
  id: string
  video_id: string
  device_id: string
  report_type: string
  reason: string
  additional_details?: string
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  admin_notes?: string
  action_taken?: string
  reported_at: string
  reviewed_at?: string
  reviewed_by?: string
  videos: {
    id: string
    title: string
    thumbnail_url: string
    duration: number
    views: number
  }
}

interface ReportStats {
  total: number
  pending: number
  under_review: number
  resolved: number
  dismissed: number
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ReportStats>({
    total: 0, pending: 0, under_review: 0, resolved: 0, dismissed: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [actionTaken, setActionTaken] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reports, filterStatus, searchTerm])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      console.log('📋 Loading reports...')
      
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
        setStats(data.statistics)
        console.log('✅ Reports loaded:', data.reports?.length)
      } else {
        console.error('❌ Failed to load reports')
      }
    } catch (error) {
      console.error('❌ Error loading reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = reports

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.videos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.report_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes,
          action_taken: actionTaken,
          reviewed_by: 'admin'
        })
      })

      if (response.ok) {
        await loadReports()
        setSelectedReport(null)
        setAdminNotes('')
        setActionTaken('')
        console.log('✅ Report status updated')
      }
    } catch (error) {
      console.error('❌ Error updating report:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'under_review': return 'text-blue-600 bg-blue-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'dismissed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'inappropriate_content': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'spam': return <Flag className="w-4 h-4 text-orange-500" />
      case 'copyright_violation': return <Shield className="w-4 h-4 text-purple-500" />
      default: return <Flag className="w-4 h-4 text-gray-500" />
    }
  }

  const formatReportType = (type: string) => {
    const translations: { [key: string]: string } = {
      'inappropriate_content': 'Uygunsuz İçerik',
      'spam': 'Spam',
      'misleading_information': 'Yanıltıcı Bilgi',
      'copyright_violation': 'Telif Hakkı İhlali',
      'violence': 'Şiddet',
      'harassment': 'Taciz',
      'adult_content': 'Yetişkin İçeriği',
      'other': 'Diğer',
      'pending': 'Bekleyen',
      'under_review': 'İnceleniyor',
      'resolved': 'Çözüldü',
      'dismissed': 'Reddedildi'
    }
    return translations[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const translateAdditionalDetails = (details: string) => {
    if (!details) return details
    
    let translated = details
    
    // Platform translations
    translated = translated.replace(/Platform: ios/gi, 'Platform: iOS')
    translated = translated.replace(/Platform: android/gi, 'Platform: Android')
    translated = translated.replace(/Platform: web/gi, 'Platform: Web')
    translated = translated.replace(/Platform:/gi, 'Platform:')
    
    // Common phrases
    translated = translated.replace(/Device:/gi, 'Cihaz:')
    translated = translated.replace(/Model:/gi, 'Model:')
    translated = translated.replace(/Unknown/gi, 'Bilinmiyor')
    translated = translated.replace(/Video reported:/gi, 'Video raporlandı:')
    translated = translated.replace(/Video reported as:/gi, 'Video şu şekilde raporlandı:')
    translated = translated.replace(/From HomeScreen/gi, 'Ana Sayfadan')
    translated = translated.replace(/From VideoDetailScreen/gi, 'Video Detay Sayfasından')
    translated = translated.replace(/reported as:/gi, 'olarak raporlandı:')
    
    // Report type translations in context
    translated = translated.replace(/Inappropriate Content/gi, 'Uygunsuz İçerik')
    translated = translated.replace(/Copyright Violation/gi, 'Telif Hakkı İhlali')
    translated = translated.replace(/Misleading Information/gi, 'Yanıltıcı Bilgi')
    translated = translated.replace(/Adult Content/gi, 'Yetişkin İçeriği')
    translated = translated.replace(/Violence/gi, 'Şiddet')
    translated = translated.replace(/Harassment/gi, 'Taciz')
    translated = translated.replace(/Other/gi, 'Diğer')
    translated = translated.replace(/Spam/gi, 'Spam')
    
    // Status translations
    translated = translated.replace(/pending/gi, 'bekleyen')
    translated = translated.replace(/under_review/gi, 'inceleniyor')
    translated = translated.replace(/resolved/gi, 'çözüldü')
    translated = translated.replace(/dismissed/gi, 'reddedildi')
    
    return translated
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Flag className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold">İçerik Bildirimleri</h1>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bildirim Türü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 8 }).map((_, index) => (
                  <TableRowSkeleton key={index} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flag className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold">İçerik Bildirimleri</h1>
        </div>
        <Button onClick={loadReports} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Toplam Bildirim</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
          <div className="text-sm text-yellow-600">Bekleyen</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-800">{stats.under_review}</div>
          <div className="text-sm text-blue-600">İncelenen</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-800">{stats.resolved}</div>
          <div className="text-sm text-green-600">Çözülen</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{stats.dismissed}</div>
          <div className="text-sm text-gray-600">Reddedilen</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Video başlığı, bildirim nedeni ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekleyen</option>
          <option value="under_review">İncelenen</option>
          <option value="resolved">Çözülen</option>
          <option value="dismissed">Reddedilen</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bildirim Türü</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.videos.title}</div>
                        <div className="text-xs text-gray-500">{report.videos.views.toLocaleString()} görüntülenme</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getReportTypeIcon(report.report_type)}
                      <span className="text-sm">{formatReportType(report.report_type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{report.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {formatReportType(report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(report.reported_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(report.reported_at).toLocaleTimeString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(report)}
                    >
                      İncele
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Bildirim Detayı</h2>
                <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Video</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{selectedReport.videos.title}</div>
                    <div className="text-sm text-gray-600">{selectedReport.videos.views.toLocaleString()} görüntülenme</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bildirim Türü</label>
                  <div className="flex items-center gap-2">
                    {getReportTypeIcon(selectedReport.report_type)}
                    <span>{formatReportType(selectedReport.report_type)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bildirim Nedeni</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{translateAdditionalDetails(selectedReport.reason)}</p>
                </div>

                {selectedReport.additional_details && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Ek Detaylar</label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{translateAdditionalDetails(selectedReport.additional_details)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Admin Notları</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="İnceleme notlarınızı buraya yazın..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yapılan İşlem</label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">İşlem seçin...</option>
                    <option value="video_removed">Video kaldırıldı</option>
                    <option value="video_restricted">Video kısıtlandı</option>
                    <option value="warning_issued">Uyarı verildi</option>
                    <option value="no_action">İşlem yapılmadı</option>
                    <option value="false_report">Yanlış bildirim</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => updateReportStatus(selectedReport.id, 'under_review')}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    İncelemeye Al
                  </Button>
                  <Button
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Çözüldü
                  </Button>
                  <Button
                    onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reddet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredReports.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz bildirim yok</h3>
          <p className="text-gray-500">Kullanıcılardan gelen içerik bildirimleri burada görünecek.</p>
        </div>
      )}
    </div>
  )
}
