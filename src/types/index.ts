import { Database } from './database'

// Database row types
export type Video = Database['public']['Tables']['videos']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type UserInteraction = Database['public']['Tables']['user_interactions']['Row']
export type AppSetting = Database['public']['Tables']['app_settings']['Row']

// Insert types
export type VideoInsert = Database['public']['Tables']['videos']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type AppSettingInsert = Database['public']['Tables']['app_settings']['Insert']

// Update types
export type VideoUpdate = Database['public']['Tables']['videos']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type AppSettingUpdate = Database['public']['Tables']['app_settings']['Update']

// View types
export type VideoStats = Database['public']['Views']['video_stats']['Row']
export type CategoryStats = Database['public']['Views']['category_stats']['Row']

// Form types for admin panel
export interface VideoFormData {
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  category_id: string
  is_featured: boolean
  is_published: boolean
  tags?: string[]
}

export interface CategoryFormData {
  name: string
  description?: string
  color?: string
  icon?: string
  slug: string
  is_featured: boolean
  sort_order: number
}

// Dashboard types
export interface DashboardStats {
  totalVideos: number
  totalCategories: number
  totalViews: number
  totalLikes: number
  todayViews: number
  weeklyViews: number
  monthlyViews: number
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// Chart data types
export interface ChartData {
  date: string
  views: number
  likes: number
  videos: number
}

export interface CategoryChartData {
  name: string
  videos: number
  views: number
  color: string
}

// Settings types
export interface ContentSettings {
  privacy_policy: string
  about_us: string
  help_support: string
  terms_of_service: string
}

// File upload types
export interface UploadResponse {
  url: string
  path: string
  error?: string
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
}

// Filter and search types
export interface VideoFilters {
  category_id?: string
  is_published?: boolean
  is_featured?: boolean
  search?: string
  sort_by?: 'created_at' | 'views' | 'likes' | 'title'
  sort_order?: 'asc' | 'desc'
}

export interface CategoryFilters {
  is_featured?: boolean
  search?: string
  sort_by?: 'name' | 'sort_order' | 'created_at'
  sort_order?: 'asc' | 'desc'
}