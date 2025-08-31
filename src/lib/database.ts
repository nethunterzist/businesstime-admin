import { Pool } from 'pg'

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Hetzner internal connection
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Database adapter replacing Supabase client
export class DatabaseAdapter {
  
  // SELECT operations
  static async select(table: string, options: {
    columns?: string[]
    where?: Record<string, any>
    orderBy?: string
    limit?: number
    offset?: number
  } = {}) {
    try {
      let query = `SELECT ${options.columns?.join(', ') || '*'} FROM ${table}`
      const values: any[] = []
      let paramCount = 0

      // WHERE clause
      if (options.where) {
        const whereClause = Object.entries(options.where).map(([key, value]) => {
          values.push(value)
          return `${key} = $${++paramCount}`
        }).join(' AND ')
        query += ` WHERE ${whereClause}`
      }

      // ORDER BY
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`
      }

      // LIMIT
      if (options.limit) {
        query += ` LIMIT ${options.limit}`
      }

      // OFFSET
      if (options.offset) {
        query += ` OFFSET ${options.offset}`
      }

      const result = await pool.query(query, values)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database SELECT error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // INSERT operations
  static async insert(table: string, data: Record<string, any> | Record<string, any>[]) {
    try {
      const records = Array.isArray(data) ? data : [data]
      const columns = Object.keys(records[0])
      const placeholders = records.map((_, index) => 
        `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(', ')})`
      ).join(', ')
      
      const values = records.flatMap(record => columns.map(col => record[col]))
      
      const query = `
        INSERT INTO ${table} (${columns.join(', ')}) 
        VALUES ${placeholders} 
        RETURNING *
      `
      
      const result = await pool.query(query, values)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database INSERT error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // UPDATE operations
  static async update(table: string, data: Record<string, any>, where: Record<string, any>) {
    try {
      const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ')
      const whereClause = Object.keys(where).map((key, index) => `${key} = $${Object.keys(data).length + index + 1}`).join(' AND ')
      
      const values = [...Object.values(data), ...Object.values(where)]
      
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`
      
      const result = await pool.query(query, values)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database UPDATE error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // DELETE operations
  static async delete(table: string, where: Record<string, any>) {
    try {
      const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ')
      const values = Object.values(where)
      
      const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`
      
      const result = await pool.query(query, values)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database DELETE error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Custom query execution
  static async query(text: string, params: any[] = []) {
    try {
      const result = await pool.query(text, params)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database QUERY error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Count records
  static async count(table: string, where: Record<string, any> = {}) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${table}`
      const values: any[] = []
      
      if (Object.keys(where).length > 0) {
        const whereClause = Object.entries(where).map(([key, value], index) => {
          values.push(value)
          return `${key} = $${index + 1}`
        }).join(' AND ')
        query += ` WHERE ${whereClause}`
      }
      
      const result = await pool.query(query, values)
      return { data: parseInt(result.rows[0].count), error: null }
      
    } catch (error) {
      console.error('Database COUNT error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Increment field (for views, likes, etc.)
  static async increment(table: string, field: string, where: Record<string, any>, amount: number = 1) {
    try {
      const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 2}`).join(' AND ')
      const values = [amount, ...Object.values(where)]
      
      const query = `UPDATE ${table} SET ${field} = ${field} + $1 WHERE ${whereClause} RETURNING *`
      
      const result = await pool.query(query, values)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database INCREMENT error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Execute stored function
  static async callFunction(functionName: string, params: any[] = []) {
    try {
      const placeholders = params.map((_, index) => `$${index + 1}`).join(', ')
      const query = `SELECT * FROM ${functionName}(${placeholders})`
      
      const result = await pool.query(query, params)
      return { data: result.rows, error: null }
      
    } catch (error) {
      console.error('Database FUNCTION error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Test connection
  static async testConnection() {
    try {
      const result = await pool.query('SELECT NOW() as current_time')
      return { 
        success: true, 
        data: { 
          current_time: result.rows[0].current_time,
          database: 'businessmobile_db'
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Export pool for advanced usage
export { pool }

// Legacy compatibility - mimic Supabase client structure
export const db = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => 
        DatabaseAdapter.select(table, { 
          columns: columns?.split(',').map(c => c.trim()), 
          where: { [column]: value } 
        }),
      limit: (count: number) =>
        DatabaseAdapter.select(table, { 
          columns: columns?.split(',').map(c => c.trim()), 
          limit: count 
        }),
      order: (column: string, options?: { ascending?: boolean }) =>
        DatabaseAdapter.select(table, { 
          columns: columns?.split(',').map(c => c.trim()), 
          orderBy: `${column} ${options?.ascending === false ? 'DESC' : 'ASC'}` 
        })
    }),
    insert: (data: Record<string, any> | Record<string, any>[]) => 
      DatabaseAdapter.insert(table, data),
    update: (data: Record<string, any>) => ({
      eq: (column: string, value: any) => 
        DatabaseAdapter.update(table, data, { [column]: value })
    }),
    delete: () => ({
      eq: (column: string, value: any) => 
        DatabaseAdapter.delete(table, { [column]: value })
    })
  })
}