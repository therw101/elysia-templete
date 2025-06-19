import { sql } from './database.service';

export interface CreateUserData {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export class UserService {
  /**
   * สร้างผู้ใช้ใหม่
   */
  async createUser(userData: CreateUserData) {
    try {
      const result = await sql`
        INSERT INTO users (
          email, username, password_hash, first_name, last_name, 
          phone_number, role
        ) VALUES (
          ${userData.email}, ${userData.username}, ${userData.passwordHash}, 
          ${userData.firstName}, ${userData.lastName}, ${userData.phoneNumber}, 
          ${userData.role}
        )
        RETURNING id, email, username, first_name, last_name, phone_number, 
                 role, is_active, created_at, updated_at
      `;
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * ค้นหาผู้ใช้จากอีเมล
   */
  async getUserByEmail(email: string) {
    try {
      const result = await sql`
        SELECT id, email, username, password_hash, first_name, last_name, 
               phone_number, role, is_active, last_login, failed_login_attempts,
               locked_until, created_at, updated_at
        FROM users 
        WHERE email = ${email} AND is_active = true
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * ค้นหาผู้ใช้จาก ID
   */
  async getUserById(id: string) {
    try {
      const result = await sql`
        SELECT id, email, username, first_name, last_name, phone_number, 
               role, is_active, last_login, created_at, updated_at
        FROM users 
        WHERE id = ${id} AND is_active = true
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * ค้นหาผู้ใช้จาก username
   */
  async getUserByUsername(username: string) {
    try {
      const result = await sql`
        SELECT id, email, username, first_name, last_name, phone_number, 
               role, is_active, last_login, created_at, updated_at
        FROM users 
        WHERE username = ${username} AND is_active = true
      `;
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * อัพเดท last login และรีเซ็ต failed attempts
   */
  async updateLastLogin(userId: string) {
    try {
      await sql`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, failed_login_attempts = 0
        WHERE id = ${userId}
      `;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * เพิ่มจำนวน failed login attempts
   */
  async incrementFailedAttempts(email: string) {
    try {
      const result = await sql`
        UPDATE users 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
              WHEN failed_login_attempts + 1 >= 5 
              THEN CURRENT_TIMESTAMP + INTERVAL '30 minutes'
              ELSE locked_until
            END
        WHERE email = ${email}
        RETURNING failed_login_attempts, locked_until
      `;
      return result[0];
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่าผู้ใช้ถูกล็อคหรือไม่
   */
  async isUserLocked(email: string) {
    try {
      const result = await sql`
        SELECT locked_until, failed_login_attempts
        FROM users 
        WHERE email = ${email}
      `;
      
      if (!result[0]) return false;
      
      const { locked_until, failed_login_attempts } = result[0];
      
      if (locked_until && new Date(locked_until) > new Date()) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if user is locked:', error);
      throw error;
    }
  }

  /**
   * อัพเดทข้อมูลผู้ใช้
   */
  async updateUser(id: string, userData: UpdateUserData) {
    try {
      const fields = [];
      const values = [];
      
      if (userData.firstName) {
        fields.push('first_name = $' + (fields.length + 1));
        values.push(userData.firstName);
      }
      if (userData.lastName) {
        fields.push('last_name = $' + (fields.length + 1));
        values.push(userData.lastName);
      }
      if (userData.phoneNumber) {
        fields.push('phone_number = $' + (fields.length + 1));
        values.push(userData.phoneNumber);
      }
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      // เพิ่ม id ใน values array
      values.push(id);
      
      const query = `
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING id, email, username, first_name, last_name, phone_number, 
                 role, is_active, created_at, updated_at
      `;
      
      const result = await sql.unsafe(query, values);
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * ลบผู้ใช้ (soft delete)
   */
  async deleteUser(id: string) {
    try {
      const result = await sql`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, email, username
      `;
      return result[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ admin)
   */
  async getAllUsers(options: { limit?: number; offset?: number; role?: string } = {}) {
    try {
      const { limit = 10, offset = 0, role } = options;
      
      let query = sql`
        SELECT id, email, username, first_name, last_name, phone_number, 
               role, is_active, last_login, created_at, updated_at
        FROM users 
      `;
      
      if (role) {
        query = sql`
          SELECT id, email, username, first_name, last_name, phone_number, 
                 role, is_active, last_login, created_at, updated_at
          FROM users 
          WHERE role = ${role}
        `;
      }
      
      const users = await sql`
        ${query}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const totalResult = role 
        ? await sql`SELECT COUNT(*) as total FROM users WHERE role = ${role}`
        : await sql`SELECT COUNT(*) as total FROM users`;
      
      return { 
        users, 
        total: parseInt(totalResult[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
