import { Elysia } from 'elysia';

export const loggingMiddleware = new Elysia()
  .onStart(() => {
    console.log('🚀 Logging middleware initialized');
  })
  .onRequest(({ request }) => {
    const timestamp = new Date().toISOString();
    const url = new URL(request.url);
    console.log(`[${timestamp}] ${request.method} ${url.pathname} - Started`);
  })
  .onAfterHandle(({ request, set }) => {
    const timestamp = new Date().toISOString();
    const url = new URL(request.url);
    console.log(`[${timestamp}] ${request.method} ${url.pathname} - ${set.status || 200}`);
  })
  .onError(({ request, error }) => {
    const timestamp = new Date().toISOString();
    const url = new URL(request.url);
    console.error(`[${timestamp}] ERROR ${request.method} ${url.pathname}:`, error);
  }); 