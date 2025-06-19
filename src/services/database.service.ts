// Database service - placeholder for future implementation
// This will contain database connection and query functions

import postgres from 'postgres';
import { databaseConfig } from '../config/database';

// สร้าง connection pool
let sql: postgres.Sql<any>;

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect() {
    try {
      // สร้าง connection ด้วย postgres js
      sql = postgres({
        host: databaseConfig.host,
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
        ssl: databaseConfig.ssl,
        max: 20, // Maximum number of connections
        idle_timeout: 20,
        connect_timeout: 10,
      });

      // ทดสอบ connection
      await sql`SELECT NOW()`;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (sql) {
        await sql.end();
        console.log('✅ Database disconnected');
      }
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  getConnection() {
    return sql;
  }
}

// Export sql connection สำหรับใช้ใน services อื่น
export { sql }; 