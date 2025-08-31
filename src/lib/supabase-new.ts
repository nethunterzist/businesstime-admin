// PostgreSQL Database Connection - Replacing Supabase
import { DatabaseAdapter, db } from './database'

// Environment variables
const databaseUrl = process.env.DATABASE_URL || ''

console.log('PostgreSQL config:', {
  hasDatabaseUrl: !!databaseUrl,
  database: 'businessmobile_db'
});

// Client and admin are same in PostgreSQL setup
export const supabase = db
export const supabaseAdmin = db

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    
    const result = await DatabaseAdapter.testConnection()
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    // Test actual data access
    const { data: videos, error } = await DatabaseAdapter.select('videos', { limit: 1 })
    
    if (error) {
      return { success: false, error }
    }
    
    return { 
      success: true, 
      data: { 
        connection: result.data,
        videoCount: videos?.length || 0
      }
    }
    
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}