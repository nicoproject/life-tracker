import mysql from 'mysql2/promise'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export type Pool = mysql.Pool

export interface Task extends RowDataPacket {
  id: number
  title: string
  status: string
  created_at: Date
}

export interface Tracker extends RowDataPacket {
  id: number
  name: string
  type: string
  target_value: number
  current_value: number
  created_at: Date
}

export interface TrackerEntry extends RowDataPacket {
  id: number
  tracker_id: number
  date: Date
  value: number
  status: string
  notes: string | null
  created_at: Date
}

export type QueryResult<T> = [T[], mysql.FieldPacket[]]

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Shikira98',
  database: 'life_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

class Database {
  private pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async query<T extends RowDataPacket>(
    sql: string,
    values?: any[],
  ): Promise<T[]> {
    const [rows] = await this.pool.query<T[]>(sql, values)
    return rows
  }

  async execute(sql: string, values?: any[]): Promise<ResultSetHeader> {
    const [result] = await this.pool.execute(sql, values)
    return result as ResultSetHeader
  }
}

export const db = new Database(pool)

