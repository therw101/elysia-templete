import { Elysia } from 'elysia';
import { jwtConfig } from '../config/database';
import type { User, UserRole } from '../types';

// Simple JWT implementation using Bun's built-in crypto
// TODO: Replace with @elysiajs/jwt when ready to add the dependency
class SimpleJWT {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async sign(payload: any): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    const signature = await this.createSignature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  async verify(token: string): Promise<any> {
    try {
      const [header, payload, signature] = token.split('.');
      
      if (!header || !payload || !signature) {
        throw new Error('Invalid token format');
      }

      // Verify signature
      const expectedSignature = await this.createSignature(`${header}.${payload}`);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const decodedPayload = JSON.parse(atob(payload));
      
      // Check expiration
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private async createSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
}

const jwt = new SimpleJWT(jwtConfig.secret);

export const authMiddleware = new Elysia()
  .derive(async ({ headers }) => {
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { currentUser: null };
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = await jwt.verify(token);
      
      if (!payload || !payload.user) {
        return { currentUser: null };
      }

      // Here you would typically fetch fresh user data from database
      // For now, we'll use the user data from the token
      const currentUser: User = payload.user;
      
      return { currentUser };
    } catch (error) {
      console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
      return { currentUser: null };
    }
  });

export const requireAuth = (app: any) => 
  app.use(authMiddleware).guard({
    beforeHandle: (ctx: any) => {
      if (!ctx.currentUser) {
        ctx.set.status = 401;
        return {
          success: false,
          message: 'Authentication required'
        };
      }
    }
  });

export const requireRole = (roles: UserRole[]) => (app: any) =>
  app.use(authMiddleware).guard({
    beforeHandle: (ctx: any) => {
      if (!ctx.currentUser) {
        ctx.set.status = 401;
        return {
          success: false,
          message: 'Authentication required'
        };
      }
      
      if (!roles.includes(ctx.currentUser.role)) {
        ctx.set.status = 403;
        return {
          success: false,
          message: 'Insufficient permissions'
        };
      }
    }
  });

// JWT utility functions for use in controllers
export const jwtUtils = {
  async generateToken(user: User): Promise<string> {
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    return await jwt.sign(payload);
  },

  async verifyToken(token: string): Promise<any> {
    return await jwt.verify(token);
  }
}; 