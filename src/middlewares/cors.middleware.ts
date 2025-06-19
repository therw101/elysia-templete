import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { serverConfig } from '../config/database';

export const corsMiddleware = new Elysia().use(
  cors({
    origin: serverConfig.cors.origin,
    credentials: serverConfig.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // exposedHeaders: ['X-Total-Count']
  })
); 