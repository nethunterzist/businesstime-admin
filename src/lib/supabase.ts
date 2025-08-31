// PostgreSQL Database Adapter - Replacing Supabase
import { DatabaseAdapter, db } from './database'

// Legacy compatibility exports
export const supabase = db
export const supabaseAdmin = {
  from: (table: string) => db.from(table),
  // Additional admin methods
  auth: {
    admin: {
      createUser: async (userData: any) => {
        return DatabaseAdapter.insert('admin_users', userData)
      }
    }
  }
}

// Database adapter export
export { DatabaseAdapter }

// Mock createClient for compatibility
export const createClient = () => db
