import { Elysia } from 'elysia';
import bcrypt from 'bcrypt';
import jwt from '@elysiajs/jwt';
import { ResponseHelper, httpStatus } from '../utils/response.utils';
import { userSchemas } from '../utils/validation.utils';
import { userService } from '../services/user.service';
import { jwtConfig } from '../config/database';
import type { CreateUserRequest, LoginRequest, AuthResponse } from '../types';
import { UserRole } from '../types';

// JWT plugin setup
const jwtPlugin = jwt({
  name: 'jwt',
  secret: jwtConfig.secret,
});

export const authController = new Elysia({ 
  prefix: '/auth',
  tags: ['Authentication']
})
  .use(jwtPlugin)
  
  // POST /auth/register
  .post('/register', async ({ body, set, jwt }) => {
    try {
      // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
      const existingUser = await userService.getUserByEmail(body.email);
      if (existingUser) {
        set.status = httpStatus.CONFLICT;
        return ResponseHelper.error('อีเมลนี้ถูกใช้งานแล้ว');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(body.password, saltRounds);

      // สร้างผู้ใช้ใหม่ในฐานข้อมูล
      const newUser = await userService.createUser({
        email: body.email,
        username: body.username,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        phoneNumber: body.phoneNumber || undefined,
        role: body.role as UserRole
      });

      // สร้าง JWT token
      const token = await jwt.sign({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      });

      const response: AuthResponse = {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          phoneNumber: newUser.phone_number,
          role: newUser.role,
          isActive: newUser.is_active,
          createdAt: newUser.created_at,
          updatedAt: newUser.updated_at
        },
        token
      };

      set.status = httpStatus.CREATED;
      return ResponseHelper.success(response, 'สมัครสมาชิกสำเร็จ');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // ตรวจสอบ unique constraint error
      if (error.code === '23505') {
        if (error.constraint_name?.includes('email')) {
          set.status = httpStatus.CONFLICT;
          return ResponseHelper.error('อีเมลนี้ถูกใช้งานแล้ว');
        }
        if (error.constraint_name?.includes('username')) {
          set.status = httpStatus.CONFLICT;
          return ResponseHelper.error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
        }
      }
      
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('การสมัครสมาชิกล้มเหลว');
    }
  }, {
    body: userSchemas.createUser,
    detail: {
      summary: 'Register new user',
      description: 'Create a new user account with email, username, and role',
      tags: ['Authentication'],
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                  },
                  message: { type: 'string', example: 'สมัครสมาชิกสำเร็จ' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        409: {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'อีเมลนี้ถูกใช้งานแล้ว' }
                }
              }
            }
          }
        }
      }
    }
  })

  // POST /auth/login
  .post('/login', async ({ body, set, jwt }) => {
    try {
      // ตรวจสอบว่าผู้ใช้ถูกล็อคหรือไม่
      const isLocked = await userService.isUserLocked(body.email);
      if (isLocked) {
        set.status = httpStatus.FORBIDDEN;
        return ResponseHelper.error('บัญชีถูกล็อค กรุณาลองใหม่อีกครั้งภายหลัง');
      }

      // ค้นหาผู้ใช้จากอีเมล
      const user = await userService.getUserByEmail(body.email);
      if (!user) {
        // เพิ่มจำนวนครั้งที่ล็อคอิน failed
        await userService.incrementFailedAttempts(body.email);
        set.status = httpStatus.UNAUTHORIZED;
        return ResponseHelper.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await bcrypt.compare(body.password, user.password_hash);
      if (!isPasswordValid) {
        // เพิ่มจำนวนครั้งที่ล็อคอิน failed
        await userService.incrementFailedAttempts(body.email);
        set.status = httpStatus.UNAUTHORIZED;
        return ResponseHelper.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      // อัพเดท last login และรีเซ็ต failed attempts
      await userService.updateLastLogin(user.id);

      // สร้าง JWT token
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          role: user.role,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        token
      };

      return ResponseHelper.success(response, 'เข้าสู่ระบบสำเร็จ');
    } catch (error) {
      console.error('Login error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('การเข้าสู่ระบบล้มเหลว');
    }
  }, {
    body: userSchemas.login,
    detail: {
      summary: 'User login',
      description: 'Authenticate user with email and password',
      tags: ['Authentication'],
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                  },
                  message: { type: 'string', example: 'เข้าสู่ระบบสำเร็จ' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
                }
              }
            }
          }
        },
        403: {
          description: 'Account locked',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'บัญชีถูกล็อค กรุณาลองใหม่อีกครั้งภายหลัง' }
                }
              }
            }
          }
        }
      }
    }
  })

  // GET /auth/me - ดูข้อมูลผู้ใช้ปัจจุบัน
  .get('/me', async ({ set, headers, jwt }) => {
    try {
      // ดึง token จาก Authorization header
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = httpStatus.UNAUTHORIZED;
        return ResponseHelper.error('กรุณาเข้าสู่ระบบ');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
             // ตรวจสอบ token
      const payload = await jwt.verify(token);
      if (!payload) {
        set.status = httpStatus.UNAUTHORIZED;
        return ResponseHelper.error('Token ไม่ถูกต้อง');
      }

      // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
      const user = await userService.getUserById(String(payload.userId));
      if (!user) {
        set.status = httpStatus.UNAUTHORIZED;
        return ResponseHelper.error('ไม่พบผู้ใช้');
      }

      return ResponseHelper.success({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          phoneNumber: user.phone_number,
          role: user.role,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }, 'ดึงข้อมูลผู้ใช้สำเร็จ');
    } catch (error) {
      console.error('Get user info error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    }
  }, {
    detail: {
      summary: 'Get current user info',
      description: 'Get information about the currently authenticated user',
      tags: ['Authentication'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User info retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' }
                    }
                  },
                  message: { type: 'string', example: 'ดึงข้อมูลผู้ใช้สำเร็จ' }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'กรุณาเข้าสู่ระบบ' }
                }
              }
            }
          }
        }
      }
    }
  })

  // POST /auth/logout - ออกจากระบบ (ในกรณีนี้แค่ส่ง success response)
  .post('/logout', async ({ set }) => {
    try {
      // ในระบบ JWT stateless ไม่จำเป็นต้องทำอะไรพิเศษ
      // Client จะลบ token ออกจาก storage
      return ResponseHelper.success(null, 'ออกจากระบบสำเร็จ');
    } catch (error) {
      console.error('Logout error:', error);
      set.status = httpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error('การออกจากระบบล้มเหลว');
    }
  }, {
    detail: {
      summary: 'User logout',
      description: 'Logout the current user',
      tags: ['Authentication'],
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'ออกจากระบบสำเร็จ' }
                }
              }
            }
          }
        }
      }
    }
  }); 