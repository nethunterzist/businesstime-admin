export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          slug: string
          is_featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          slug: string
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          slug?: string
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          category_id: string | null
          views: number
          likes: number
          dislikes: number
          is_featured: boolean
          is_published: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          category_id?: string | null
          views?: number
          likes?: number
          dislikes?: number
          is_featured?: boolean
          is_published?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          category_id?: string | null
          views?: number
          likes?: number
          dislikes?: number
          is_featured?: boolean
          is_published?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      user_interactions: {
        Row: {
          id: string
          device_id: string
          video_id: string
          interaction_type: 'view' | 'like' | 'dislike' | 'save' | 'share'
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          video_id: string
          interaction_type: 'view' | 'like' | 'dislike' | 'save' | 'share'
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          video_id?: string
          interaction_type?: 'view' | 'like' | 'dislike' | 'save' | 'share'
          created_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: any
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: any
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: any
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      video_stats: {
        Row: {
          id: string
          title: string
          views: number
          likes: number
          dislikes: number
          like_percentage: number
          category_name: string | null
          created_at: string
        }
      }
      category_stats: {
        Row: {
          id: string
          name: string
          video_count: number
          total_views: number
          total_likes: number
        }
      }
    }
    Functions: {
      increment_video_views: {
        Args: { video_uuid: string }
        Returns: void
      }
      get_trending_videos: {
        Args: { limit_count?: number }
        Returns: Array<{
          id: string
          title: string
          thumbnail_url: string | null
          views: number
          created_at: string
        }>
      }
      get_featured_videos: {
        Args: Record<PropertyKey, never>
        Returns: Array<{
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          category_name: string | null
        }>
      }
    }
  }
}
